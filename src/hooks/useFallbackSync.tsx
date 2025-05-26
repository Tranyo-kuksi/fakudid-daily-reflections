
import { supabase } from '@/integrations/supabase/client';

export function useFallbackSync() {
  const fallbackToDatabaseSync = async (uid: string, storageKey: string, value: any) => {
    try {
      console.log("Falling back to database sync...");
      
      // Use the profiles table as primary fallback
      const preferenceField = storageKey.replace('user-', '');
      
      const updateData = { 
        [preferenceField]: value, 
        updated_at: new Date().toISOString() 
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', uid);
        
      if (updateError) {
        console.error('Error updating preferences in profiles:', updateError);
        
        // Secondary fallback: Save to journal_entries
        await fallbackToJournalEntries(uid, storageKey, value);
      } else {
        console.log('Successfully synced data to profiles table as fallback');
      }
    } catch (error) {
      console.error('Error in fallbackToDatabaseSync:', error);
      await fallbackToJournalEntries(uid, storageKey, value);
    }
  };
  
  const fallbackToJournalEntries = async (uid: string, storageKey: string, value: any) => {
    try {
      // Format the data for journal_entries table
      const entryData = {
        id: `${storageKey}-${uid}`, // Create a unique ID
        user_id: uid,
        date: new Date().toISOString(), // Required field
        title: `User ${storageKey.replace('user-', '')}`,
        content: JSON.stringify(value),
      };
      
      const { error } = await supabase
        .from('journal_entries')
        .upsert(entryData, { onConflict: 'id' });
        
      if (error) {
        console.error('Error syncing data to journal_entries:', error);
      } else {
        console.log('Successfully synced data to journal_entries as secondary fallback');
      }
    } catch (error) {
      console.error('Error in fallbackToJournalEntries:', error);
    }
  };

  const loadFromDatabase = async (uid: string, storageKey: string) => {
    try {
      console.log(`Falling back to database for ${storageKey}...`);
      
      // Convert key names to match database columns
      const preferenceField = storageKey.replace('user-', '');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(preferenceField)
        .eq('id', uid)
        .single();
        
      if (error) {
        console.error(`Error loading ${preferenceField} from profiles:`, error);
        return null;
      }
      
      if (data && data[preferenceField]) {
        console.log(`✅ Loaded ${storageKey} from database`);
        return data[preferenceField];
      }
      
      return null;
    } catch (error) {
      console.error(`Error loading from database for ${storageKey}:`, error);
      return null;
    }
  };

  return { fallbackToDatabaseSync, loadFromDatabase };
}
