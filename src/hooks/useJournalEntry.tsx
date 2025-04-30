
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { 
  getTodayEntry, 
  autosaveEntry, 
  getEntryById, 
  updateEntry 
} from "@/services/journalService";
import { toast } from "@/components/ui/sonner";

export const useJournalEntry = () => {
  const [journalTitle, setJournalTitle] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [highlightedContent, setHighlightedContent] = useState<React.ReactNode | null>(null);
  const [highlightedTitle, setHighlightedTitle] = useState<React.ReactNode | null>(null);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [templateData, setTemplateData] = useState<{ sections: Record<string, string[]> } | undefined>(undefined);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const params = useParams();
  const location = useLocation();
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

  // Function to highlight search text
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
      // Update existing entry in edit mode - directly update the entry while preserving its date
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
        toast.success("Journal entry updated");
      }
    } else {
      // Normal save - create or update today's entry
      saved = await autosaveEntry(
        journalTitle, 
        journalEntry.trim(), 
        selectedMood as any, 
        templateData,
        entryId // Pass the current entryId to make sure we update the right one
      );
      
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
    }
  };

  // Update autosave effect to include template data and handle entry ID properly
  useEffect(() => {
    if (readOnly && !editMode) return; // Don't autosave if in read-only mode and not editing
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (journalTitle.trim() || journalEntry.trim() || selectedMood) {
      autoSaveTimerRef.current = setTimeout(async () => {
        const saved = await autosaveEntry(
          journalTitle, 
          journalEntry, 
          selectedMood as any, 
          templateData,
          editMode ? entryId : undefined // Only pass entryId when in edit mode
        );
        
        if (saved && !isEditing && !editMode) {
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
  }, [journalTitle, journalEntry, selectedMood, templateData, readOnly, isEditing, editMode, entryId]);

  return {
    journalTitle,
    setJournalTitle,
    journalEntry,
    setJournalEntry,
    selectedMood,
    setSelectedMood,
    isEditing,
    entryId,
    readOnly,
    editMode,
    highlightedContent,
    highlightedTitle,
    currentEntry,
    setCurrentEntry,
    templateData,
    setTemplateData,
    moodNames,
    searchQuery,
    toggleEditMode,
    handleSave,
  };
};
