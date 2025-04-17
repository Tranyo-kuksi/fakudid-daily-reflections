
import { toast } from "@/components/ui/sonner";

export interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  mood: "dead" | "sad" | "meh" | "good" | "awesome" | null;
  attachments?: {
    type: "image" | "music";
    url: string;
    name: string;
  }[];
}

// In-memory storage for journal entries (in a real app, this would be a database)
let journalEntries: JournalEntry[] = loadEntriesFromStorage();

// Load entries from localStorage
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

// Save entries to localStorage
function saveEntriesToStorage() {
  try {
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
  } catch (error) {
    console.error('Failed to save journal entries:', error);
    toast.error("Failed to save your journal entries");
  }
}

// Get all journal entries
export function getAllEntries(): JournalEntry[] {
  return [...journalEntries].sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Get today's entry if it exists
export function getTodayEntry(): JournalEntry | undefined {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return journalEntries.find(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });
}

// Get entry by ID
export function getEntryById(id: string): JournalEntry | undefined {
  return journalEntries.find(entry => entry.id === id);
}

// Get entry by date
export function getEntryByDate(date: Date): JournalEntry | undefined {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return journalEntries.find(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === targetDate.getTime();
  });
}

// Create a new entry (only if no entry exists for today)
export function createEntry(content: string, mood: JournalEntry['mood']): JournalEntry | null {
  const todayEntry = getTodayEntry();
  if (todayEntry) {
    toast.error("You've already created a journal entry for today");
    return null;
  }
  
  const newEntry: JournalEntry = {
    id: Date.now().toString(),
    date: new Date(),
    content,
    mood,
    attachments: []
  };
  
  journalEntries.push(newEntry);
  saveEntriesToStorage();
  toast.success("Journal entry created successfully");
  return newEntry;
}

// Update an existing entry
export function updateEntry(id: string, updates: Partial<JournalEntry>): JournalEntry | null {
  const index = journalEntries.findIndex(entry => entry.id === id);
  if (index === -1) return null;
  
  journalEntries[index] = { ...journalEntries[index], ...updates };
  saveEntriesToStorage();
  return journalEntries[index];
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
export function addAttachment(
  entryId: string, 
  type: "image" | "music", 
  file: File
): Promise<JournalEntry | null> {
  return new Promise((resolve) => {
    const entry = getEntryById(entryId);
    if (!entry) {
      toast.error("Journal entry not found");
      resolve(null);
      return;
    }
    
    // In a real app, we would upload the file to a server
    // For this demo, we'll create a URL for the file
    const url = URL.createObjectURL(file);
    
    if (!entry.attachments) {
      entry.attachments = [];
    }
    
    entry.attachments.push({
      type,
      url,
      name: file.name
    });
    
    const updatedEntry = updateEntry(entryId, { attachments: entry.attachments });
    toast.success(`${type} attachment added`);
    resolve(updatedEntry);
  });
}

// Autosave functionality - returns true if saved successfully
export function autosaveEntry(content: string, mood: JournalEntry['mood']): boolean {
  // Check if there's already an entry for today
  let todayEntry = getTodayEntry();
  
  if (todayEntry) {
    // Update existing entry
    updateEntry(todayEntry.id, { content, mood });
    return true;
  } else if (content.trim() || mood) {
    // Create new entry if there's content or mood
    createEntry(content, mood);
    return true;
  }
  
  return false;
}
