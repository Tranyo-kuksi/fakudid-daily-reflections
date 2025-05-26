import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchAllEntriesFromSupabase,
  saveEntryToSupabase,
  deleteEntryFromSupabase,
  getEntryByIdFromSupabase,
  getEntryByDateFromSupabase
} from "./supabaseJournalService";

export interface JournalEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
  mood: "dead" | "sad" | "meh" | "good" | "awesome" | null;
  attachments?: {
    type: "image" | "music" | "spotify";
    url: string;
    name: string;
    data?: string;
    spotifyUri?: string;
    albumImageUrl?: string;
  }[];
  userId?: string;
  templateData?: {
    sections: Record<string, string[]>;
  };
}

// In-memory cache for journal entries
let journalEntries: JournalEntry[] = [];
let syncInProgress = false;

// Save entries to localStorage only as a backup
function saveEntriesToLocalStorage(entries: JournalEntry[]) {
  try {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save journal entries to localStorage:', error);
  }
}

// Load entries from localStorage as a fallback only
function loadEntriesFromLocalStorage(): JournalEntry[] {
  try {
    const savedEntries = localStorage.getItem('journalEntries');
    return savedEntries ? JSON.parse(savedEntries, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    }) : [];
  } catch (error) {
    console.error('Failed to load journal entries from localStorage:', error);
    return [];
  }
}

// Get all journal entries for the current user
export async function getAllEntries(): Promise<JournalEntry[]> {
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    
    if (userId && !syncInProgress) {
      syncInProgress = true;
      
      try {
        console.log("Fetching entries from Supabase...");
        const supabaseEntries = await fetchAllEntriesFromSupabase();
        
        if (supabaseEntries.length >= 0) {
          journalEntries = supabaseEntries;
          // Keep localStorage as backup only
          saveEntriesToLocalStorage(journalEntries);
        }
      } catch (error) {
        console.error("Error fetching from Supabase:", error);
        // Fallback to localStorage only if Supabase fails
        if (journalEntries.length === 0) {
          journalEntries = loadEntriesFromLocalStorage();
        }
      } finally {
        syncInProgress = false;
      }
    } else if (!userId) {
      // Not authenticated, use localStorage
      journalEntries = loadEntriesFromLocalStorage();
    }
    
    return [...journalEntries]
      .filter(entry => {
        if (!entry.userId) return !userId;
        return entry.userId === userId;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Error in getAllEntries:", error);
    toast.error("Failed to load your journal entries");
    return [];
  }
}

// Get today's entry if it exists for the current user
export async function getTodayEntry(): Promise<JournalEntry | undefined> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  
  if (userId) {
    const todayEntry = await getEntryByDateFromSupabase(today);
    if (todayEntry) {
      const index = journalEntries.findIndex(entry => entry.id === todayEntry.id);
      if (index >= 0) {
        journalEntries[index] = todayEntry;
      } else {
        journalEntries.push(todayEntry);
      }
      saveEntriesToLocalStorage(journalEntries);
      return todayEntry;
    }
  }
  
  return journalEntries.find(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    if (!entry.userId) return entryDate.getTime() === today.getTime() && !userId;
    return entry.userId === userId && entryDate.getTime() === today.getTime();
  });
}

// Get entry by ID
export async function getEntryById(id: string): Promise<JournalEntry | undefined> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  
  if (userId) {
    const supabaseEntry = await getEntryByIdFromSupabase(id);
    if (supabaseEntry) {
      const index = journalEntries.findIndex(entry => entry.id === supabaseEntry.id);
      if (index >= 0) {
        journalEntries[index] = supabaseEntry;
      } else {
        journalEntries.push(supabaseEntry);
      }
      saveEntriesToLocalStorage(journalEntries);
      return supabaseEntry;
    }
  }
  
  return journalEntries.find(entry => {
    if (!entry.userId) return entry.id === id && !userId;
    return entry.id === id && entry.userId === userId;
  });
}

// Get entry by date for the current user
export async function getEntryByDate(date: Date): Promise<JournalEntry | undefined> {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  
  if (userId) {
    const supabaseEntry = await getEntryByDateFromSupabase(targetDate);
    if (supabaseEntry) {
      const index = journalEntries.findIndex(entry => entry.id === supabaseEntry.id);
      if (index >= 0) {
        journalEntries[index] = supabaseEntry;
      } else {
        journalEntries.push(supabaseEntry);
      }
      saveEntriesToLocalStorage(journalEntries);
      return supabaseEntry;
    }
  }
  
  return journalEntries.find(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    if (!entry.userId) return entryDate.getTime() === targetDate.getTime() && !userId;
    return entry.userId === userId && entryDate.getTime() === targetDate.getTime();
  });
}

// Update an existing entry
export function updateEntry(id: string, updates: Partial<JournalEntry>): JournalEntry | null {
  const index = journalEntries.findIndex(entry => entry.id === id);
  if (index === -1) return null;
  
  const updatedEntry = { 
    ...journalEntries[index], 
    ...updates,
    date: updates.date || journalEntries[index].date
  };
  
  journalEntries[index] = updatedEntry;
  
  // Save to Supabase immediately
  saveEntryToSupabase(updatedEntry).catch(error => {
    console.error("Error saving updated entry to Supabase:", error);
  });
  
  saveEntriesToLocalStorage(journalEntries);
  return updatedEntry;
}

// Delete an entry
export function deleteEntry(id: string): boolean {
  const initialLength = journalEntries.length;
  journalEntries = journalEntries.filter(entry => entry.id !== id);
  
  if (journalEntries.length < initialLength) {
    deleteEntryFromSupabase(id).catch(error => {
      console.error("Error deleting entry from Supabase:", error);
    });
    
    saveEntriesToLocalStorage(journalEntries);
    return true;
  }
  
  return false;
}

// Add attachment to an entry
export async function addAttachment(
  entryId: string, 
  type: "image" | "music", 
  file: File
): Promise<JournalEntry | null> {
  return new Promise(async (resolve) => {
    const entry = await getEntryById(entryId);
    if (!entry) {
      toast.error("Journal entry not found");
      resolve(null);
      return;
    }
    
    // Create a URL for the file (for temporary display)
    const url = URL.createObjectURL(file);
    
    // For persistent storage, we'll convert files to base64
    let fileData: string | undefined = undefined;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      fileData = reader.result as string;
      
      if (!entry.attachments) {
        entry.attachments = [];
      }
      
      entry.attachments.push({
        type,
        url, // Keep URL for immediate display
        name: file.name,
        data: fileData // Store base64 data for persistence
      });
      
      const updatedEntry = updateEntry(entryId, { attachments: entry.attachments });
      toast.success(`${type === 'image' ? 'Image' : 'Audio'} attachment added`);
      resolve(updatedEntry);
    };
    
    reader.readAsDataURL(file);
  });
}

// Add Spotify track as an attachment
export async function addSpotifyTrack(
  entryId: string,
  track: any
): Promise<JournalEntry | null> {
  const entry = await getEntryById(entryId);
  if (!entry) {
    toast.error("Journal entry not found");
    return null;
  }
  
  if (!entry.attachments) {
    entry.attachments = [];
  }
  
  entry.attachments.push({
    type: "spotify",
    url: "",
    name: `${track.name} - ${track.artists}`,
    spotifyUri: track.uri,
    albumImageUrl: track.albumImageUrl
  });
  
  const updatedEntry = updateEntry(entryId, { attachments: entry.attachments });
  if (updatedEntry) {
    toast.success("Spotify song added");
  }
  
  return updatedEntry;
}

// Delete an attachment from an entry
export async function deleteAttachment(entryId: string, attachmentIndex: number): Promise<JournalEntry | null> {
  const entry = await getEntryById(entryId);
  if (!entry || !entry.attachments) {
    return null;
  }
  
  // Remove the attachment at the specified index
  const newAttachments = [...entry.attachments];
  newAttachments.splice(attachmentIndex, 1);
  
  // Update the entry with the new attachments array
  const updatedEntry = updateEntry(entryId, { attachments: newAttachments });
  
  if (updatedEntry) {
    toast.success("Attachment deleted");
  }
  
  return updatedEntry;
}

// Autosave functionality
export async function autosaveEntry(
  title: string, 
  content: string, 
  mood: JournalEntry['mood'],
  templateData?: { sections: Record<string, string[]> },
  entryId?: string
): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;

    if (entryId) {
      const existingEntry = journalEntries.find(entry => entry.id === entryId);
      if (existingEntry) {
        const updated = updateEntry(entryId, { title, content, mood, templateData });
        return !!updated;
      }
    }
    
    let todayEntry = await getTodayEntry();
    
    if (todayEntry) {
      updateEntry(todayEntry.id, { title, content, mood, templateData });
      return true;
    } else if (title.trim() || content.trim() || mood || (templateData && Object.keys(templateData.sections).length > 0)) {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date(),
        title,
        content,
        mood,
        attachments: [],
        userId,
        templateData
      };
      
      journalEntries.push(newEntry);
      
      if (userId) {
        saveEntryToSupabase(newEntry).catch(error => {
          console.error("Error saving new entry to Supabase:", error);
        });
      }
      
      saveEntriesToLocalStorage(journalEntries);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in autosaveEntry:", error);
    toast.error("Failed to save your journal entry");
    return false;
  }
}

// Force a sync from Supabase
export async function syncFromSupabase(): Promise<boolean> {
  if (syncInProgress) {
    console.log("Sync already in progress");
    return false;
  }
  
  syncInProgress = true;
  
  try {
    const supabaseEntries = await fetchAllEntriesFromSupabase();
    
    if (supabaseEntries.length >= 0) {
      journalEntries = supabaseEntries;
      saveEntriesToLocalStorage(journalEntries);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error syncing from Supabase:", error);
    return false;
  } finally {
    syncInProgress = false;
  }
}

// Initialize - run this when the app starts
export async function initializeJournalService(): Promise<void> {
  try {
    journalEntries = loadEntriesFromLocalStorage();
    
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      await syncFromSupabase();
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, syncing from Supabase");
        await syncFromSupabase();
      }
    });
  } catch (error) {
    console.error("Error initializing journal service:", error);
  }
}

initializeJournalService();
