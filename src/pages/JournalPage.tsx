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
  getEntryById,
  updateEntry
} from "@/services/journalService";
import { toast } from "@/components/ui/sonner";
import { AttachmentViewer } from "@/components/attachments/AttachmentViewer";
import { MoodPicker } from "@/components/journal/MoodPicker";
import { AttachmentControls } from "@/components/journal/AttachmentControls";
import { PromptButton } from "@/components/journal/PromptButton";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Sparkles, Save, Edit, X } from "lucide-react";
import { TemplateDialog } from "@/components/templates/TemplateDialog";

export default function JournalPage() {
  // ... keep existing code (variable declarations and state)

  const [journalTitle, setJournalTitle] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [highlightedContent, setHighlightedContent] = useState<React.ReactNode | null>(null);
  const [highlightedTitle, setHighlightedTitle] = useState<React.ReactNode | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [templateData, setTemplateData] = useState<{ sections: Record<string, string[]> } | undefined>(undefined);
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
          setTemplateData(specificEntry.templateData);
          setIsEditing(true);
          
          // If it's not today's entry, make it read-only
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const entryDate = new Date(specificEntry.date);
          entryDate.setHours(0, 0, 0, 0);
          
          if (entryDate.getTime() !== today.getTime()) {
            setReadOnly(true);
            setEditMode(false);
          } else {
            setReadOnly(false);
            setEditMode(false);
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
        setTemplateData(todayEntry.templateData);
        setIsEditing(true);
        setReadOnly(false);
        setEditMode(false);
      } else {
        // Reset the form for a new entry
        setJournalTitle("");
        setJournalEntry("");
        setSelectedMood(null);
        setEntryId(null);
        setCurrentEntry(null);
        setTemplateData(undefined);
        setIsEditing(false);
        setReadOnly(false);
        setEditMode(false);
      }
    };

    loadEntry();
  }, [params.id, location.search]);

  // Update autosave effect to include template data
  useEffect(() => {
    if (readOnly && !editMode) return; // Don't autosave if in read-only mode and not editing
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (journalTitle.trim() || journalEntry.trim() || selectedMood) {
      autoSaveTimerRef.current = setTimeout(async () => {
        const saved = await autosaveEntry(journalTitle, journalEntry, selectedMood as any, templateData);
        if (saved && !isEditing) {
          const entry = await getTodayEntry();
          if (entry) {
            setEntryId(entry.id);
            setCurrentEntry(entry);
            setIsEditing(true);
          }
        }
      }, 500);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [journalTitle, journalEntry, selectedMood, templateData, readOnly, isEditing, editMode]);

  // Listen for template insertion events
  useEffect(() => {
    const handleTemplateInserted = () => {
      const content = localStorage.getItem('current-journal-content');
      const templateValues = localStorage.getItem('current-template-values');
      
      if (content) {
        setJournalEntry(content);
        localStorage.removeItem('current-journal-content');
      }
      
      if (templateValues) {
        setTemplateData(JSON.parse(templateValues));
        localStorage.removeItem('current-template-values');
      }
      
      setIsTemplateDialogOpen(false);
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

  // Toggle edit mode for past entries
  const toggleEditMode = () => {
    if (!readOnly) return;
    
    if (editMode) {
      // If exiting edit mode, save changes
      handleSave();
      setEditMode(false);
    } else {
      // Entering edit mode
      setEditMode(true);
    }
  };

  const handleSave = async () => {
    if (readOnly && !editMode) {
      toast.error("Cannot modify past entries without entering edit mode");
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
    
    let saved = false;
    
    if (editMode && entryId) {
      // Update existing entry in edit mode
      const updatedEntry = updateEntry(entryId, {
        title: journalTitle,
        content: journalEntry,
        mood: selectedMood as any,
        templateData
      });
      
      if (updatedEntry) {
        setCurrentEntry(updatedEntry);
        saved = true;
        setEditMode(false);
      }
    } else {
      // Normal save - create or update today's entry
      saved = await autosaveEntry(journalTitle, journalEntry.trim(), selectedMood as any, templateData);
    }
    
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
      
      toast.success(editMode ? "Journal entry updated" : (isEditing ? "Journal entry updated" : "Journal entry saved"));
    }
  };

  const handleImageAttachment = async () => {
    if (readOnly && !editMode) {
      toast.error("Cannot modify past entries without entering edit mode");
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
      
      const saved = await autosaveEntry(journalTitle, journalEntry.trim(), selectedMood as any, templateData);
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
    if (readOnly && !editMode) {
      toast.error("Cannot modify past entries without entering edit mode");
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
      
      const saved = await autosaveEntry(journalTitle, journalEntry.trim(), selectedMood as any, templateData);
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
    if (readOnly && !editMode) {
      toast.error("Cannot modify past entries without entering edit mode");
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
    if (readOnly && !editMode) {
      toast.error("Cannot modify past entries without entering edit mode");
      return;
    }
    
    if (entryId) {
      const updatedEntry = await deleteAttachment(entryId, attachmentIndex);
      if (updatedEntry) {
        setCurrentEntry(updatedEntry);
      }
    }
  };

  // Function to view template data of a past entry
  const viewTemplateData = () => {
    if (!templateData || Object.keys(templateData.sections).length === 0) {
      toast.info("No template data for this entry");
      return;
    }
    
    setIsTemplateDialogOpen(true);
  };

  return (
    <div className="w-full h-full relative">
      {readOnly && (
        <div className={`${editMode ? "bg-amber-100 dark:bg-amber-950" : "bg-yellow-100 dark:bg-yellow-900"} p-3 mb-4 rounded-md flex justify-between items-center`}>
          <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
            {editMode ? (
              "You are editing a past entry. Click Save when finished."
            ) : (
              <>
                This is a past entry. You are viewing it in read-only mode.
                {searchQuery && 
                  <span className="ml-2">
                    Showing results for: <strong>{searchQuery}</strong>
                  </span>
                }
              </>
            )}
          </p>
          <Button
            variant={editMode ? "destructive" : "outline"}
            size="sm"
            onClick={toggleEditMode}
            className="ml-2"
          >
            {editMode ? (
              <>
                <X size={16} className="mr-1" /> Cancel Edit
              </>
            ) : (
              <>
                <Edit size={16} className="mr-1" /> Edit Entry
              </>
            )}
          </Button>
        </div>
      )}
      
      <div className="mb-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {readOnly && !editMode && highlightedTitle ? (
              <div className="text-lg w-full border rounded-md p-2">
                {highlightedTitle || "Untitled"}
              </div>
            ) : (
              <Input
                placeholder="Title your day..."
                className="text-lg w-full"
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                readOnly={readOnly && !editMode}
              />
            )}
          </div>
          
          <MoodPicker
            selectedMood={selectedMood}
            setSelectedMood={(mood) => setSelectedMood(mood)}
            moodNames={moodNames}
            readOnly={readOnly && !editMode}
          />
        </div>

        <div className="flex justify-between items-center">
          <AttachmentControls
            onImageClick={handleImageAttachment}
            onMusicClick={handleMusicAttachment}
            fileInputRef={fileInputRef}
            audioInputRef={audioInputRef}
            onFileSelected={handleFileSelected}
            readOnly={readOnly && !editMode}
          />

          {readOnly && !editMode ? (
            (isSubscribed && templateData && Object.keys(templateData.sections).length > 0) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={viewTemplateData}
                className="flex items-center gap-2"
              >
                <LayoutGrid size={16} />
                View Template Data
              </Button>
            )
          ) : (
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
              onDelete={(readOnly && !editMode) ? undefined : handleDeleteAttachment}
            />
          </div>
        )}
      </div>

      <div className="relative">
        {readOnly && !editMode && highlightedContent ? (
          <div className="min-h-[calc(100vh-240px)] w-full resize-none text-lg p-4 border rounded-md whitespace-pre-wrap">
            {highlightedContent}
          </div>
        ) : (
          <Textarea 
            placeholder="Write about your day..."
            className="min-h-[calc(100vh-240px)] w-full resize-none text-lg p-4 focus:border-fakudid-purple border-none"
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            readOnly={readOnly && !editMode}
          />
        )}

        {(!readOnly || editMode) && (
          <div className="fixed bottom-8 right-8 flex flex-col gap-2">
            {editMode && (
              <Button 
                className="rounded-full shadow-lg w-12 h-12 p-0"
                onClick={handleSave}
              >
                <Save size={20} />
              </Button>
            )}
            <PromptButton
              journalEntry={journalEntry}
              onPromptGenerated={setJournalEntry}
              readOnly={readOnly && !editMode}
            />
          </div>
        )}
      </div>

      <TemplateDialog 
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        initialValues={templateData}
        readOnly={readOnly && !editMode}
        onEdit={toggleEditMode}
        entryId={entryId || undefined}
      />
    </div>
  );
}
