
import { supabase } from '@/integrations/supabase/client';
import { useFallbackSync } from './useFallbackSync';

export function useCloudSync() {
  const { fallbackToDatabaseSync, loadFromDatabase } = useFallbackSync();

  const loadFromCloudStorage = async (uid: string, storageKey: string) => {
    try {
      const filePath = `${uid}/${storageKey}.json`;
      
      const { data, error } = await supabase.storage
        .from('user-files')
        .download(filePath);
      
      if (error) {
        console.log(`No data found in cloud storage or error: ${error.message}`);
        // If no data in storage, try to load from database as fallback
        return await loadFromDatabase(uid, storageKey);
      }
      
      if (data) {
        const text = await data.text();
        try {
          const parsed = JSON.parse(text);
          console.log(`✅ Loaded ${storageKey} from cloud storage`);
          return parsed;
        } catch (parseError) {
          console.error(`Error parsing cloud data for ${storageKey}:`, parseError);
          // If storage data is corrupt, try database
          return await loadFromDatabase(uid, storageKey);
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error loading from cloud storage for ${storageKey}:`, error);
      // If storage fails, try database
      return await loadFromDatabase(uid, storageKey);
    }
  };

  const syncToSupabaseStorage = async (uid: string, storageKey: string, value: any) => {
    try {
      const filePath = `${uid}/${storageKey}.json`;
      
      const { data, error } = await supabase.storage
        .from('user-files')
        .upload(filePath, JSON.stringify(value), {
          upsert: true,
          cacheControl: '3600',
          contentType: 'application/json',
        });
        
      if (error) {
        console.error('Error uploading to Supabase Storage:', error);
        
        // Fallback to database if storage fails
        await fallbackToDatabaseSync(uid, storageKey, value);
      } else {
        console.log(`✅ Synced ${storageKey} to Supabase Storage`);
      }
    } catch (error) {
      console.error('Error in syncToSupabaseStorage:', error);
      
      // Try fallback method if the primary method fails
      await fallbackToDatabaseSync(uid, storageKey, value);
    }
  };

  return { loadFromCloudStorage, syncToSupabaseStorage };
}
