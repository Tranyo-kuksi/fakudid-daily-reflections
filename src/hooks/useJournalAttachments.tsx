
import { useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { 
  getTodayEntry, 
  addAttachment,
  deleteAttachment
} from "@/services/journalService";

export const useJournalAttachments = (
  entryId: string | null, 
  currentEntry: any, 
  setCurrentEntry: (entry: any) => void,
  readOnly: boolean,
  editMode: boolean,
  journalEntry: string,
  selectedMood: string | null,
  autosaveEntry: (title: string, content: string, mood: any, templateData?: any) => Promise<boolean>
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

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
      
      const saved = await autosaveEntry("", journalEntry.trim(), selectedMood as any);
      if (!saved) {
        toast.error("Failed to save journal entry. Please try again.");
        return;
      }
      
      const todayEntry = await getTodayEntry();
      if (todayEntry) {
        setCurrentEntry(todayEntry);
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
      
      const saved = await autosaveEntry("", journalEntry.trim(), selectedMood as any);
      if (!saved) {
        toast.error("Failed to save journal entry. Please try again.");
        return;
      }
      
      const todayEntry = await getTodayEntry();
      if (todayEntry) {
        setCurrentEntry(todayEntry);
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

  return {
    fileInputRef,
    audioInputRef,
    handleImageAttachment,
    handleMusicAttachment,
    handleFileSelected,
    handleDeleteAttachment
  };
};
