
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

export const useTemplateHandling = (
  journalEntry: string, 
  setJournalEntry: (entry: string) => void,
  setTemplateData: (data: any) => void,
  templateData: any,
  readOnly: boolean,
  editMode: boolean,
  toggleEditMode: () => void
) => {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Function to view template data of a past entry
  const viewTemplateData = () => {
    if (!templateData || Object.keys(templateData.sections).length === 0) {
      toast.info("No template data for this entry");
      return;
    }
    
    setIsTemplateDialogOpen(true);
  };

  // Save current content before opening template dialog
  const openTemplateDialog = () => {
    if (journalEntry) {
      localStorage.setItem('current-journal-content', journalEntry);
    }
    setIsTemplateDialogOpen(true);
  };

  // Listen for template insertion events
  useEffect(() => {
    const handleTemplateInserted = () => {
      const content = localStorage.getItem('current-journal-content');
      const templateValues = localStorage.getItem('current-template-values');
      
      if (content) {
        // Extract the template portion (everything after the last double newline)
        const parts = content.split('\n\n');
        const existingContent = journalEntry;
        const templateContent = parts[parts.length - 1];
        
        // Style the template content differently by wrapping it in a special div
        const styledTemplateContent = `\n\n<div class="template-content">${templateContent}</div>`;
        setJournalEntry(existingContent + styledTemplateContent);
        
        localStorage.removeItem('current-journal-content');
      }
      
      if (templateValues) {
        setTemplateData(JSON.parse(templateValues));
        localStorage.removeItem('current-template-values');
      }
      
      setIsTemplateDialogOpen(false);
    };

    const handleTemplateAutosave = (event: CustomEvent<{ templateValues: any }>) => {
      setTemplateData(event.detail.templateValues);
    };

    window.addEventListener('template-inserted', handleTemplateInserted);
    window.addEventListener('template-autosave', handleTemplateAutosave as EventListener);
    
    return () => {
      window.removeEventListener('template-inserted', handleTemplateInserted);
      window.removeEventListener('template-autosave', handleTemplateAutosave as EventListener);
    };
  }, [journalEntry, setJournalEntry, setTemplateData]);

  return {
    isTemplateDialogOpen,
    setIsTemplateDialogOpen,
    viewTemplateData,
    openTemplateDialog
  };
};
