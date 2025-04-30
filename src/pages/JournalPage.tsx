import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { 
  getTodayEntry, 
  autosaveEntry, 
  addAttachment,
  deleteAttachment,
  getAllEntries,
  getEntryById
} from "@/services/journalService";
import { toast } from "@/components/ui/sonner";
import { AttachmentViewer } from "@/components/attachments/AttachmentViewer";
import { MoodPicker } from "@/components/journal/MoodPicker";
import { AttachmentControls } from "@/components/journal/AttachmentControls";
import { PromptButton } from "@/components/journal/PromptButton";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Sparkles } from "lucide-react";
import { TemplateDialog } from "@/components/templates/TemplateDialog";

export default function JournalPage() {
  // ... keep existing code (variable declarations and state)

  const [journalTitle, setJournalTitle] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [highlightedContent, setHighlightedContent] = useState<React.ReactNode | null>(null);
  const [highlightedTitle, setHighlightedTitle] = useState<React.ReactNode | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSubscribed, openCheckout } = useSubscription();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');

  // Custom mood names
  const [moodNames, setMoodNames] = useState<{[key: string]: string}>({
    dead: "Dead Inside",
    sad: "Shity",
    meh: "Meh",
    good: "Pretty Good",
    awesome: "Fucking AWESOME"
  });
  
  // Load custom mood names
  useEffect(() => {
    const storedMoodNames = localStorage.getItem("fakudid-mood-names");
    if (storedMoodNames) {
      setMoodNames(JSON.parse(storedMoodNames));
    }
  }, []);

  // Function to highlight search terms in text
  const highlightSearchText = (text: string) => {
    if (!searchQuery || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery?.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900">{part}</mark> 
        : part
    );
  };

  // Load entry based on URL parameters
  useEffect(() => {
    const loadEntry = async () => {
      console.log("Loading entry with search query:", searchQuery);
      
      // If we have an ID in the URL, load that specific entry
      if (params.id) {
        const specificEntry = await getEntryById(params.id);
        if (specificEntry) {
          setJournalTitle(specificEntry.title || "");
          setJournalEntry(specificEntry.content);
          
          // If search query exists, create highlighted versions
          if (searchQuery) {
            console.log("Highlighting search term:", searchQuery);
            setHighlightedTitle(specificEntry.title ? highlightSearchText(specificEntry.title) : "");
            setHighlightedContent(highlightSearchText(specificEntry.content));
          } else {
            setHighlightedTitle(null);
            setHighlightedContent(null);
          }
          
          setSelectedMood(specificEntry.mood);
          setEntryId(specificEntry.id);
          setCurrentEntry(specificEntry);
          setIsEditing(true);
          
          // If it's not today's entry, make it read-only
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const entryDate = new Date(specificEntry.date);
          entryDate.setHours(0, 0, 0, 0);
          
          if (entryDate.getTime() !== today.getTime()) {
            setReadOnly(true);
          } else {
            setReadOnly(false);
          }
          
          return;
        }
      }

      // If no ID in URL or ID not found, load today's entry
      const todayEntry = await getTodayEntry();
      if (todayEntry) {
        setJournalTitle(todayEntry.title || "");
        setJournalEntry(todayEntry.content);
        setSelectedMood(todayEntry.mood);
        setEntryId(todayEntry.id);
        setCurrentEntry(todayEntry);
        setIsEditing(true);
        setReadOnly(false);
      } else {
        // Reset the form for a new entry
        setJournalTitle("");
        setJournalEntry("");
        setSelectedMood(null);
        setEntryId(null);
        setCurrentEntry(null);
        setIsEditing(false);
        setReadOnly(false);
      }
    };

    loadEntry();
  }, [params.id, location.search]);

  // Update autosave effect with shorter delay (500ms instead of 3000ms)
  useEffect(() => {
    if (readOnly) return; // Don't autosave if in read-only mode
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (journalTitle.trim() || journalEntry.trim() || selectedMood) {
      autoSaveTimerRef.current = setTimeout(async () => {
        const saved = await autosaveEntry(journalTitle, journalEntry, selectedMood as any);
        if (saved && !isEditing) {
          const entry = await getTodayEntry();
          if (entry) {
            setEntryId(entry.id);
            setCurrentEntry(entry);
            setIsEditing(true);
          }
        }
      }, 500); // Changed from 3000ms to 500ms
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [journalTitle, journalEntry, selectedMood, readOnly, isEditing]);

  // Listen for template insertion events
  useEffect(() => {
    const handleTemplateInserted = () => {
      const content = localStorage.getItem('current-journal-content');
      if (content) {
        setJournalEntry(content);
        localStorage.removeItem('current-journal-content');
        setIsTemplateDialogOpen(false);
      }
    };

    window.addEventListener('template-inserted', handleTemplateInserted);
    return () => {
      window.removeEventListener('template-inserted', handleTemplateInserted);
    };
  }, []);

  // Save current content before opening template dialog
  const openTemplateDialog = () => {
    if (journalEntry) {
      localStorage.setItem('current-journal-content', journalEntry);
    }
    setIsTemplateDialogOpen(true);
  };

  const handleSave = async () => {
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }
    
    if (!journalEntry.trim()) {
      toast.error("Please write something in your journal");
      return;
    }
    
    if (!selectedMood) {
      toast.error("Please select a mood for your entry");
      return;
    }
    
    const saved = await autosaveEntry(journalTitle, journalEntry.trim(), selectedMood as any);
    
    if (saved) {
      if (!isEditing) {
        const todayEntry = await getTodayEntry();
        if (todayEntry) {
          setEntryId(todayEntry.id);
          setCurrentEntry(todayEntry);
          setIsEditing(true);
        }
      } else {
        const updatedEntry = await getEntryById(entryId!);
        if (updatedEntry) {
          setCurrentEntry(updatedEntry);
        }
      }
      
      toast.success(isEditing ? "Journal entry updated" : "Journal entry saved");
    }
  };

  const handleImageAttachment = async () => {
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }
    
    if (!entryId) {
      if (!journalEntry.trim()) {
        toast.error("Please write something in your journal before adding attachments");
        return;
      }
      
      if (!selectedMood) {
        toast.error("Please select a mood for your entry before adding attachments");
        return;
      }
      
      const saved = await autosaveEntry(journalTitle, journalEntry.trim(), selectedMood as any);
      if (!saved) {
        toast.error("Failed to save journal entry. Please try again.");
        return;
      }
      
      const todayEntry = await getTodayEntry();
      if (todayEntry) {
        setEntryId(todayEntry.id);
        setCurrentEntry(todayEntry);
        setIsEditing(true);
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleMusicAttachment = async () => {
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }
    
    if (!entryId) {
      if (!journalEntry.trim()) {
        toast.error("Please write something in your journal before adding attachments");
        return;
      }
      
      if (!selectedMood) {
        toast.error("Please select a mood for your entry before adding attachments");
        return;
      }
      
      const saved = await autosaveEntry(journalTitle, journalEntry.trim(), selectedMood as any);
      if (!saved) {
        toast.error("Failed to save journal entry. Please try again.");
        return;
      }
      
      const todayEntry = await getTodayEntry();
      if (todayEntry) {
        setEntryId(todayEntry.id);
        setCurrentEntry(todayEntry);
        setIsEditing(true);
        if (audioInputRef.current) {
          audioInputRef.current.click();
        }
      }
    } else if (audioInputRef.current) {
      audioInputRef.current.click();
    }
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "music") => {
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }
    
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    if (entryId) {
      const updatedEntry = await addAttachment(entryId, type, files[0]);
      if (updatedEntry) {
        setCurrentEntry(updatedEntry);
      }
      toast.success(`${type === "image" ? "Image" : "Audio"} attached successfully`);
    } else {
      toast.error("Something went wrong. Please try saving your entry first.");
    }
    
    event.target.value = '';
  };

  const handleDeleteAttachment = async (attachmentIndex: number) => {
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }
    
    if (entryId) {
      const updatedEntry = await deleteAttachment(entryId, attachmentIndex);
      if (updatedEntry) {
        setCurrentEntry(updatedEntry);
      }
    }
  };

  return (
    <div className="w-full h-full relative">
      {readOnly && (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 mb-4 rounded-md">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium text-center">
            This is a past entry. You are viewing it in read-only mode.
            {searchQuery && 
              <span className="ml-2">
                Showing results for: <strong>{searchQuery}</strong>
              </span>
            }
          </p>
        </div>
      )}
      
      <div className="mb-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {readOnly && highlightedTitle ? (
              <div className="text-lg w-full border rounded-md p-2">
                {highlightedTitle || "Untitled"}
              </div>
            ) : (
              <Input
                placeholder="Title your day..."
                className="text-lg w-full"
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                readOnly={readOnly}
              />
            )}
          </div>
          
          <MoodPicker
            selectedMood={selectedMood}
            setSelectedMood={(mood) => setSelectedMood(mood)}
            moodNames={moodNames}
            readOnly={readOnly}
          />
        </div>

        <div className="flex justify-between items-center">
          <AttachmentControls
            onImageClick={handleImageAttachment}
            onMusicClick={handleMusicAttachment}
            fileInputRef={fileInputRef}
            audioInputRef={audioInputRef}
            onFileSelected={handleFileSelected}
            readOnly={readOnly}
          />

          {!readOnly && (
            isSubscribed ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openTemplateDialog}
                className="flex items-center gap-2"
              >
                <LayoutGrid size={16} />
                Template
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openCheckout}
                className="flex items-center gap-2"
              >
                <Sparkles size={16} className="text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400">Premium Templates</span>
              </Button>
            )
          )}
        </div>

        {currentEntry?.attachments && currentEntry.attachments.length > 0 && (
          <div className="bg-background p-4 rounded-md border">
            <AttachmentViewer 
              attachments={currentEntry.attachments} 
              size="medium"
              onDelete={readOnly ? undefined : handleDeleteAttachment}
            />
          </div>
        )}
      </div>

      <div className="relative">
        {readOnly && highlightedContent ? (
          <div className="min-h-[calc(100vh-240px)] w-full resize-none text-lg p-4 border rounded-md whitespace-pre-wrap">
            {highlightedContent}
          </div>
        ) : (
          <Textarea 
            placeholder="Write about your day..."
            className="min-h-[calc(100vh-240px)] w-full resize-none text-lg p-4 focus:border-fakudid-purple border-none"
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            readOnly={readOnly}
          />
        )}

        {!readOnly && (
          <div className="fixed bottom-8 right-8">
            <PromptButton
              journalEntry={journalEntry}
              onPromptGenerated={setJournalEntry}
              readOnly={readOnly}
            />
          </div>
        )}
      </div>

      <TemplateDialog 
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
      />
    </div>
  );
}
