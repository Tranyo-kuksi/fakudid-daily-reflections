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

export default function JournalPage() {
  const [journalTitle, setJournalTitle] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSubscribed, openCheckout } = useSubscription();

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

  // Load entry based on URL parameters
  useEffect(() => {
    const loadEntry = async () => {
      // If we have an ID in the URL, load that specific entry
      if (params.id) {
        const specificEntry = await getEntryById(params.id);
        if (specificEntry) {
          setJournalTitle(specificEntry.title || "");
          setJournalEntry(specificEntry.content);
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
  }, [params.id, location.pathname]);

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
          </p>
        </div>
      )}
      
      <div className="mb-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Title your day..."
              className="text-lg w-full"
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              readOnly={readOnly}
            />
          </div>
          
          <MoodPicker
            selectedMood={selectedMood}
            setSelectedMood={(mood) => setSelectedMood(mood)}
            moodNames={moodNames}
            readOnly={readOnly}
          />
        </div>

        <AttachmentControls
          onImageClick={handleImageAttachment}
          onMusicClick={handleMusicAttachment}
          fileInputRef={fileInputRef}
          audioInputRef={audioInputRef}
          onFileSelected={handleFileSelected}
          readOnly={readOnly}
        />

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
        <Textarea 
          placeholder="Write about your day..."
          className="min-h-[calc(100vh-240px)] w-full resize-none text-lg p-4 focus:border-fakudid-purple border-none"
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          readOnly={readOnly}
        />

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
    </div>
  );
}
