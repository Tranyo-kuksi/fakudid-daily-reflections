import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Trash2, ImageIcon, LayoutGrid, RefreshCw, CloudUpload } from "lucide-react";
import { 
  getAllEntries, 
  deleteEntry,
  syncFromSupabase,
  JournalEntry 
} from "@/services/journalService";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [viewingTemplateEntry, setViewingTemplateEntry] = useState<JournalEntry | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isSubscribed } = useSubscription();

  // Load all entries
  useEffect(() => {
    loadEntries();
    
    // Set up periodic refresh of entries (every 30 seconds)
    const refreshInterval = setInterval(() => {
      loadEntries(false); // silent refresh, no UI indication
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const loadEntries = async (showToast = true) => {
    try {
      const allEntries = await getAllEntries();
      setEntries(allEntries);
      setFilteredEntries(allEntries);
      
      if (showToast && allEntries.length > 0) {
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error loading entries:", error);
      if (showToast) {
        toast.error("Failed to load journal entries");
      }
    }
  };

  // Force sync from Supabase
  const forceSync = async () => {
    setIsSyncing(true);
    try {
      const success = await syncFromSupabase();
      if (success) {
        await loadEntries();
        setLastSyncTime(new Date().toLocaleTimeString());
        toast.success("Journal entries synchronized successfully");
      } else {
        toast.info("No new entries found to synchronize");
      }
    } catch (error) {
      console.error("Error syncing entries:", error);
      toast.error("Failed to synchronize journal entries");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter entries based on search query in both content and title
    const filtered = entries.filter(entry => 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        toast.success("Entry deleted successfully");
      }
    }
  };

  const getMoodColor = (mood: string | null): string => {
    switch (mood) {
      case "dead":
        return "bg-mood-dead text-white";
      case "sad":
        return "bg-mood-sad text-white";
      case "meh":
        return "bg-mood-meh text-white";
      case "good":
        return "bg-mood-good text-white";
      case "awesome":
        return "bg-gold-gradient text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Function to get the mood name
  const getMoodName = (mood: string | null): string => {
    if (!mood) return "No Mood";
    
    const moodNames = JSON.parse(localStorage.getItem("fakudid-mood-names") || JSON.stringify({
      dead: "Dead Inside",
      sad: "Shity",
      meh: "Meh",
      good: "Pretty Good",
      awesome: "Fucking AWESOME"
    }));
    
    return moodNames[mood] || "Unknown Mood";
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const navigateToEntry = (entry: JournalEntry) => {
    // Always pass search query to entry view for highlighting
    if (searchQuery.trim()) {
      console.log("Navigating to entry with search:", searchQuery);
      navigate(`/entry/${entry.id}?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/entry/${entry.id}`);
    }
  };

  // Function to view template data from a specific entry
  const viewTemplateData = (entry: JournalEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!entry.templateData || Object.keys(entry.templateData.sections).length === 0) {
      toast.info("No template data for this entry");
      return;
    }
    
    setViewingTemplateEntry(entry);
    setIsTemplateDialogOpen(true);
  };

  // Function to highlight search terms in text
  const highlightSearchText = (text: string) => {
    if (!searchQuery.trim() || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900">{part}</mark> 
        : part
    );
  };

  // Function to get entry preview that includes search term
  const getEntryPreview = (entry: JournalEntry): string => {
    if (!searchQuery.trim() || !entry.content) return truncateText(entry.content, 50);
    
    // Find the position of the search term in the content
    const position = entry.content.toLowerCase().indexOf(searchQuery.toLowerCase());
    
    // If the term is not found or is near the beginning, use the default truncation
    if (position === -1 || position < 25) {
      return truncateText(entry.content, 50);
    }
    
    // Otherwise, extract a section around the first occurrence of the search term
    const start = Math.max(0, position - 20);
    const preview = (start > 0 ? '...' : '') + entry.content.substring(start, position + searchQuery.length + 30) + '...';
    
    return preview;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Journal History</h1>
      
      {lastSyncTime && (
        <div className="text-xs text-right text-muted-foreground mb-2">
          Last synchronized: {lastSyncTime}
          <Button 
            onClick={forceSync} 
            variant="ghost" 
            size="sm" 
            disabled={isSyncing} 
            className="ml-2 h-6 px-2 text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>
        </div>
      )}
      
      <div className="flex gap-2 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search entries by text, title or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline" className="px-3">
            <Search className="h-5 w-5" />
          </Button>
        </form>
      </div>
      
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
                    {searchQuery && entry.title 
                      ? highlightSearchText(entry.title) 
                      : entry.title || "Untitled"}
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
                <div className={`px-3 py-1 rounded-full ${getMoodColor(entry.mood)}`}>
                  <span className="text-sm font-medium">{getMoodName(entry.mood)}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? highlightSearchText(getEntryPreview(entry)) 
                    : truncateText(entry.content, 50)}
                </p>
                
                <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                  {entry.attachments && entry.attachments.some(a => a.type === 'image') && (
                    <div className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      <span>Images</span>
                    </div>
                  )}
                  
                  {entry.templateData && Object.keys(entry.templateData.sections).length > 0 && (
                    <div 
                      className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => viewTemplateData(entry, e)}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      <span>View Templates</span>
                    </div>
                  )}
                </div>
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

      {/* Template Viewer Dialog */}
      {viewingTemplateEntry && (
        <TemplateDialog
          isOpen={isTemplateDialogOpen}
          onClose={() => setIsTemplateDialogOpen(false)}
          initialValues={viewingTemplateEntry.templateData}
          readOnly={true}
          onEdit={() => navigate(`/entry/${viewingTemplateEntry.id}`)}
          entryId={viewingTemplateEntry.id}
        />
      )}
    </div>
  );
}
