
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Check authentication status on mount and try to load from Storage
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const id = session?.user?.id || null;
      
      setIsAuthenticated(!!session);
      setUserId(id);
      
      // If authenticated, try to fetch from cloud storage
      if (id && (key === 'user-settings' || key === 'user-preferences')) {
        await loadFromCloudStorage(id, key);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isAuth = !!session;
      setIsAuthenticated(isAuth);
      
      const newUserId = session?.user?.id || null;
      setUserId(newUserId);
      
      // If user just logged in, try to load from cloud storage
      if (isAuth && newUserId && (key === 'user-settings' || key === 'user-preferences')) {
        await loadFromCloudStorage(newUserId, key);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [key]);
  
  // Function to load data from cloud storage
  const loadFromCloudStorage = async (uid: string, storageKey: string) => {
    try {
      const filePath = `${uid}/${storageKey}.json`;
      
      const { data, error } = await supabase.storage
        .from('user-files')
        .download(filePath);
      
      if (error) {
        console.log(`No data found in cloud storage or error: ${error.message}`);
        return;
      }
      
      if (data) {
        const text = await data.text();
        try {
          const parsed = JSON.parse(text);
          console.log(`✅ Loaded ${storageKey} from cloud storage`);
          setStoredValue(parsed);
          
          // Also update localStorage for offline access
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(storageKey, text);
          }
        } catch (parseError) {
          console.error(`Error parsing cloud data for ${storageKey}:`, parseError);
        }
      }
    } catch (error) {
      console.error(`Error loading from cloud storage for ${storageKey}:`, error);
    }
  };

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
          // On mobile, localStorage might have quota exceeded or be unavailable
          console.log("Falling back to in-memory storage");
        }
      }
      
      // If we're authenticated, sync to Supabase Storage
      if (isAuthenticated && userId && (key === 'user-settings' || key === 'user-preferences')) {
        syncToSupabaseStorage(userId, key, valueToStore);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Function to sync data to Supabase Storage when authenticated
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
        fallbackToDatabaseSync(uid, storageKey, value);
      } else {
        console.log(`✅ Synced ${storageKey} to Supabase Storage`);
      }
    } catch (error) {
      console.error('Error in syncToSupabaseStorage:', error);
      
      // Try fallback method if the primary method fails
      if (userId) {
        fallbackToDatabaseSync(userId, storageKey, value);
      }
    }
  };
  
  // Fallback function to save preferences to profiles table
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
        fallbackToJournalEntries(uid, storageKey, value);
      } else {
        console.log('Successfully synced data to profiles table as fallback');
      }
    } catch (error) {
      console.error('Error in fallbackToDatabaseSync:', error);
      fallbackToJournalEntries(uid, storageKey, value);
    }
  };
  
  // Last resort fallback function to save preferences to journal_entries
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

  // Listen for changes to this localStorage key in other windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
