
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export interface JournalEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
  mood: "dead" | "sad" | "meh" | "good" | "awesome" | null;
  attachments?: {
    type: "image" | "music" | "spotify" | "voice";
    url: string;
    name: string;
    data?: string; // Base64 data for persistent storage
    metadata?: {
      artist?: string;
      album?: string;
      albumArt?: string;
      previewUrl?: string;
      externalUrl?: string;
      spotifyId?: string;
    };
  }[];
  userId?: string;
  templateData?: {
    sections: Record<string, string[]>;
  };
}

// Load entries from localStorage with user ID filtering
function loadEntriesFromStorage(): JournalEntry[] {
  try {
    const savedEntries = localStorage.getItem('journalEntries');
    return savedEntries ? JSON.parse(savedEntries, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    }) : [];
  } catch (error) {
    console.error('Failed to load journal entries:', error);
    return [];
  }
}

// In-memory storage for journal entries (in a real app, this would be a database)
let journalEntries: JournalEntry[] = loadEntriesFromStorage();

// Save entries to localStorage
function saveEntriesToStorage() {
  try {
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
  } catch (error) {
    console.error('Failed to save journal entries:', error);
    toast.error("Failed to save your journal entries");
  }
}

// Get all journal entries for the current user
export async function getAllEntries(): Promise<JournalEntry[]> {
  // Get current user ID
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  
  // Filter entries by user ID
  return [...journalEntries]
    .filter(entry => {
      // If entry has no userId, it's from before this change
      // and we want to maintain backward compatibility
      if (!entry.userId) return true;
      
      // Otherwise, only return entries for the current user
      return entry.userId === userId;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Get today's entry if it exists for the current user
export async function getTodayEntry(): Promise<JournalEntry | undefined> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get current user ID
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  
  return journalEntries.find(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    // If entry has no userId, it's from before this change
    if (!entry.userId) return entryDate.getTime() === today.getTime();
    
    // Otherwise, only match entries for the current user
    return entry.userId === userId && entryDate.getTime() === today.getTime();
  });
}

// Get entry by ID (and check user ID if available)
export async function getEntryById(id: string): Promise<JournalEntry | undefined> {
  // Get current user ID
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  
  return journalEntries.find(entry => {
    // If entry has no userId, it's from before this change
    if (!entry.userId) return entry.id === id;
    
    // Otherwise, only match entries for the current user
    return entry.id === id && entry.userId === userId;
  });
}

// Get entry by date for the current user
export async function getEntryByDate(date: Date): Promise<JournalEntry | undefined> {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  // Get current user ID
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  
  return journalEntries.find(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    // If entry has no userId, it's from before this change
    if (!entry.userId) return entryDate.getTime() === targetDate.getTime();
    
    // Otherwise, only match entries for the current user
    return entry.userId === userId && entryDate.getTime() === targetDate.getTime();
  });
}

// Update an existing entry - modified to preserve the original date
export function updateEntry(id: string, updates: Partial<JournalEntry>): JournalEntry | null {
  const index = journalEntries.findIndex(entry => entry.id === id);
  if (index === -1) return null;
  
  // Make sure we're not overriding the original date when editing
  const updatedEntry = { 
    ...journalEntries[index], 
    ...updates,
    // Preserve the original date
    date: updates.date || journalEntries[index].date
  };
  
  journalEntries[index] = updatedEntry;
  saveEntriesToStorage();
  return updatedEntry;
}

// Delete an entry
export function deleteEntry(id: string): boolean {
  const initialLength = journalEntries.length;
  journalEntries = journalEntries.filter(entry => entry.id !== id);
  
  if (journalEntries.length < initialLength) {
    saveEntriesToStorage();
    toast.success("Journal entry deleted");
    return true;
  }
  
  return false;
}

// Add attachment to an entry
export async function addAttachment(
  entryId: string, 
  type: "image" | "music" | "voice",
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
    
    if (type === "image" || type === "voice") {
      // Convert image/audio to base64 for persistent storage
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
        toast.success(`${type === 'image' ? 'Image' : type === 'voice' ? 'Voice recording' : 'Audio'} attachment added`);
        resolve(updatedEntry);
      };
      reader.readAsDataURL(file);
    } else {
      // For regular audio files
      if (!entry.attachments) {
        entry.attachments = [];
      }
      
      entry.attachments.push({
        type,
        url,
        name: file.name
      });
      
      const updatedEntry = updateEntry(entryId, { attachments: entry.attachments });
      toast.success(`Audio attachment added`);
      resolve(updatedEntry);
    }
  });
}

// Add Spotify track to an entry
export async function addSpotifyTrack(
  entryId: string,
  track: {
    id: string;
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    previewUrl: string | null;
    externalUrl: string;
  }
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
    url: track.previewUrl || track.externalUrl,
    name: track.name,
    metadata: {
      artist: track.artist,
      album: track.album,
      albumArt: track.albumArt,
      previewUrl: track.previewUrl || undefined,
      externalUrl: track.externalUrl,
      spotifyId: track.id
    }
  });
  
  const updatedEntry = updateEntry(entryId, { attachments: entry.attachments });
  toast.success(`"${track.name}" by ${track.artist} added to your journal`);
  return updatedEntry;
}

// Add voice recording to an entry
export async function addVoiceRecording(
  entryId: string,
  blob: Blob,
  fileName: string
): Promise<JournalEntry | null> {
  return new Promise(async (resolve) => {
    const entry = await getEntryById(entryId);
    if (!entry) {
      toast.error("Journal entry not found");
      resolve(null);
      return;
    }
    
    // Create a URL for immediate playback
    const url = URL.createObjectURL(blob);
    
    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      
      if (!entry.attachments) {
        entry.attachments = [];
      }
      
      entry.attachments.push({
        type: "voice",
        url,
        name: fileName,
        data: base64data
      });
      
      const updatedEntry = updateEntry(entryId, { attachments: entry.attachments });
      toast.success("Voice recording added to your journal");
      resolve(updatedEntry);
    };
    
    reader.readAsDataURL(blob);
  });
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

// Autosave functionality - modified to handle past entries properly
export async function autosaveEntry(
  title: string, 
  content: string, 
  mood: JournalEntry['mood'],
  templateData?: { sections: Record<string, string[]> },
  entryId?: string // Add entryId parameter to handle existing entries
): Promise<boolean> {
  // If we have an entryId, update that specific entry instead of looking for today's
  if (entryId) {
    const existingEntry = journalEntries.find(entry => entry.id === entryId);
    if (existingEntry) {
      updateEntry(entryId, { title, content, mood, templateData });
      return true;
    }
  }
  
  // Otherwise check for today's entry as before
  let todayEntry = await getTodayEntry();
  
  // Get current user ID
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  
  if (todayEntry) {
    // Update existing today's entry
    updateEntry(todayEntry.id, { title, content, mood, templateData });
    return true;
  } else if (title.trim() || content.trim() || mood || (templateData && Object.keys(templateData.sections).length > 0)) {
    // Create new entry if there's content, mood, or template data
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
    saveEntriesToStorage();
    return true;
  }
  
  return false;
}
