
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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      
      // If we're authenticated, sync to Supabase
      if (isAuthenticated && (key === 'user-settings' || key === 'user-preferences')) {
        syncToSupabase(key, valueToStore);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Function to sync data to Supabase when authenticated
  const syncToSupabase = async (key: string, value: any) => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        console.log("No user ID available for syncing data");
        return;
      }

      // Use the profiles table to store user preferences
      // First, check if the profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      const preferenceField = key.replace('user-', '');
      
      if (existingProfile) {
        // Update the profile with the new preferences
        const updateData = { 
          [preferenceField]: value, 
          updated_at: new Date().toISOString() 
        };
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating preferences in profiles:', updateError);
          
          // Fallback: Save to journal_entries as a special type of entry
          fallbackToJournalEntries(userId, key, value);
        } else {
          console.log('Successfully synced data to profiles:', key);
        }
      } else {
        // Profile doesn't exist, this shouldn't happen normally
        // But just in case, use the fallback method
        fallbackToJournalEntries(userId, key, value);
      }
    } catch (error) {
      console.error('Error in syncToSupabase:', error);
      
      // Try to get user ID again for fallback
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (userId) {
        fallbackToJournalEntries(userId, key, value);
      }
    }
  };
  
  // Fallback function to save preferences to journal_entries
  const fallbackToJournalEntries = async (userId: string, key: string, value: any) => {
    try {
      // Format the data for journal_entries table
      const entryData = {
        id: `${key}-${userId}`, // Create a unique ID
        user_id: userId,
        date: new Date().toISOString(), // Required field
        title: `User ${key.replace('user-', '')}`,
        content: JSON.stringify(value),
      };
      
      const { error } = await supabase
        .from('journal_entries')
        .upsert(entryData, { onConflict: 'id' });
        
      if (error) {
        console.error('Error syncing data to journal_entries:', error);
      } else {
        console.log('Successfully synced data to journal_entries:', key);
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
