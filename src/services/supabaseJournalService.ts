
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { JournalEntry } from "./journalService";

// Convert JournalEntry to database format
const entryToDbFormat = (entry: JournalEntry) => ({
  id: entry.id,
  user_id: entry.userId,
  date: entry.date.toISOString(),
  title: entry.title,
  content: entry.content,
  mood: entry.mood,
  attachments: entry.attachments || null,
  template_data: entry.templateData || null
});

// Convert database format to JournalEntry
const dbToEntryFormat = (dbEntry: any): JournalEntry => ({
  id: dbEntry.id,
  date: new Date(dbEntry.date),
  title: dbEntry.title || "",
  content: dbEntry.content || "",
  mood: dbEntry.mood as any,
  attachments: dbEntry.attachments || [],
  userId: dbEntry.user_id,
  templateData: dbEntry.template_data
});

// Fetch all entries for the current user
export async function fetchAllEntriesFromSupabase(): Promise<JournalEntry[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log("No active session, can't fetch entries");
      return [];
    }

    const userId = session.session.user.id;
    console.log("Fetching entries for user:", userId);

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error("Error fetching entries from Supabase:", error);
      toast.error("Failed to load your journal entries");
      return [];
    }

    console.log(`Successfully fetched ${data?.length} entries from Supabase`);
    return data.map(dbToEntryFormat);
  } catch (error) {
    console.error("Error in fetchAllEntriesFromSupabase:", error);
    toast.error("Failed to load your journal entries");
    return [];
  }
}

// Save a single entry to Supabase
export async function saveEntryToSupabase(entry: JournalEntry): Promise<JournalEntry | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log("No active session, can't save entry");
      return null;
    }

    // Ensure the user ID is set
    if (!entry.userId) {
      entry.userId = session.session.user.id;
    }

    const dbEntry = entryToDbFormat(entry);
    console.log("Saving entry to Supabase:", dbEntry);
    
    // Use upsert to handle both insert and update
    const { data, error } = await supabase
      .from('journal_entries')
      .upsert(dbEntry, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error("Error saving entry to Supabase:", error);
      toast.error("Failed to save your journal entry");
      return null;
    }

    console.log("Successfully saved entry to Supabase:", data);
    return dbToEntryFormat(data);
  } catch (error) {
    console.error("Error in saveEntryToSupabase:", error);
    toast.error("Failed to save your journal entry");
    return null;
  }
}

// Delete an entry from Supabase
export async function deleteEntryFromSupabase(entryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error("Error deleting entry from Supabase:", error);
      toast.error("Failed to delete your journal entry");
      return false;
    }

    toast.success("Journal entry deleted");
    return true;
  } catch (error) {
    console.error("Error in deleteEntryFromSupabase:", error);
    toast.error("Failed to delete your journal entry");
    return false;
  }
}

// Get an entry by ID
export async function getEntryByIdFromSupabase(id: string): Promise<JournalEntry | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log("No active session, can't fetch entry");
      return null;
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.session.user.id)
      .single();

    if (error) {
      console.error("Error fetching entry by ID from Supabase:", error);
      return null;
    }

    return dbToEntryFormat(data);
  } catch (error) {
    console.error("Error in getEntryByIdFromSupabase:", error);
    return null;
  }
}

// Get an entry by date
export async function getEntryByDateFromSupabase(date: Date): Promise<JournalEntry | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.log("No active session, can't fetch entry");
      return null;
    }
    
    // Format the date to match the database format
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', session.session.user.id)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      console.error("Error fetching entry by date from Supabase:", error);
      return null;
    }

    return dbToEntryFormat(data[0]);
  } catch (error) {
    console.error("Error in getEntryByDateFromSupabase:", error);
    return null;
  }
}
