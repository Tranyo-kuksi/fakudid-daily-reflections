import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper, Edit, Trash2 } from "lucide-react";
import { 
  getAllEntries, 
  getEntryById, 
  updateEntry, 
  deleteEntry,
  JournalEntry 
} from "@/services/journalService";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { AttachmentViewer } from "@/components/attachments/AttachmentViewer";
import { ImageIcon, Music } from "lucide-react";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setEditContent(entry.content);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEntry) {
      const success = deleteEntry(selectedEntry.id);
      if (success) {
        // Update the local state to remove the entry
        const updatedEntries = entries.filter(e => e.id !== selectedEntry.id);
        setEntries(updatedEntries);
        setFilteredEntries(filteredEntries.filter(e => e.id !== selectedEntry.id));
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const saveEdit = () => {
    if (selectedEntry) {
      const updated = updateEntry(selectedEntry.id, { content: editContent });
      if (updated) {
        // Update local entries with the edited content
        const updatedEntries = entries.map(e => 
          e.id === selectedEntry.id ? { ...e, content: editContent } : e
        );
        setEntries(updatedEntries);
        setFilteredEntries(filteredEntries.map(e => 
          e.id === selectedEntry.id ? { ...e, content: editContent } : e
        ));
        setIsEditDialogOpen(false);
        toast.success("Journal entry updated");
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
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
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
                <p className="text-muted-foreground line-clamp-2">{entry.content}</p>
                
                {entry.attachments && entry.attachments.length > 0 && (
                  <div className="mt-3">
                    <AttachmentViewer attachments={entry.attachments} size="small" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600"
                  onClick={() => handleEdit(entry)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600"
                  onClick={() => handleDelete(entry)}
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
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Input
              value={selectedEntry?.title || ""}
              onChange={(e) => setSelectedEntry(prev => prev ? {...prev, title: e.target.value} : prev)}
              placeholder="Entry title"
              className="mb-4"
            />
            <Textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)} 
              className="min-h-[200px]"
            />
            
            {selectedEntry?.attachments && selectedEntry.attachments.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Attachments</h3>
                <AttachmentViewer attachments={selectedEntry.attachments} size="medium" />
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
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
