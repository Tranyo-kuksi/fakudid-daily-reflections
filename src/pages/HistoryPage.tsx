import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper, Trash2, ImageIcon } from "lucide-react";
import { 
  getAllEntries, 
  deleteEntry,
  JournalEntry 
} from "@/services/journalService";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Load all entries
  useEffect(() => {
    const loadEntries = () => {
      const allEntries = getAllEntries();
      setEntries(allEntries);
      setFilteredEntries(allEntries);
    };
    
    loadEntries();
    
    // Setup an interval to check for new entries (simulating real-time updates)
    const intervalId = setInterval(loadEntries, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter entries based on search query
    const filtered = entries.filter(entry => 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(entry.date).toLocaleDateString().includes(searchQuery)
    );
    setFilteredEntries(filtered);
  };

  const handleDelete = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEntry) {
      const success = deleteEntry(selectedEntry.id);
      if (success) {
        const updatedEntries = entries.filter(e => e.id !== selectedEntry.id);
        setEntries(updatedEntries);
        setFilteredEntries(filteredEntries.filter(e => e.id !== selectedEntry.id));
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const getMoodIcon = (mood: string | null) => {
    switch (mood) {
      case "dead":
        return <Skull className="h-5 w-5 text-mood-dead" />;
      case "sad":
        return <FrownIcon className="h-5 w-5 text-mood-sad" />;
      case "meh":
        return <MehIcon className="h-5 w-5 text-mood-meh" />;
      case "good":
        return <SmileIcon className="h-5 w-5 text-mood-good" />;
      case "awesome":
        return <PartyPopper className="h-5 w-5 text-mood-awesome" />;
      default:
        return null;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const navigateToEntry = (entry: JournalEntry) => {
    navigate(`/?id=${entry.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Journal History</h1>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          placeholder="Search entries by text or date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="outline" className="px-3">
          <Search className="h-5 w-5" />
        </Button>
      </form>
      
      <div className="space-y-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <Card 
              key={entry.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigateToEntry(entry)}
            >
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <div>
                  <h3 className="font-medium text-lg mb-1">
                    {entry.title || "Untitled"}
                  </h3>
                  <p className="font-medium text-sm text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>{getMoodIcon(entry.mood)}</div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-muted-foreground">
                  {truncateText(entry.content, 50)}
                  <span className="bg-gradient-to-r from-transparent to-background inline-block w-8 ml-1"></span>
                </p>
                
                {entry.attachments && entry.attachments.some(a => a.type === 'image') && (
                  <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span>Has images</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No entries found matching your search.</p>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p>Are you sure you want to delete this journal entry? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
