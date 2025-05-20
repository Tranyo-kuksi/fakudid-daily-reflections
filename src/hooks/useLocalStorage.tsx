
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

      // Create a properly formatted entry for the user_preferences table
      // We'll store the data in the journal_entries table for now
      // In a more complete solution, you would create a dedicated user_preferences table
      const entryData = {
        id: `${key}-${userId}`, // Create a unique ID
        user_id: userId,
        date: new Date().toISOString(), // Required field
        title: `User ${key.replace('user-', '')}`,
        content: JSON.stringify(value),
      };
      
      // Save to journal_entries as a special type of entry
      const { error } = await supabase
        .from('journal_entries')
        .upsert(entryData, { onConflict: 'id' });
        
      if (error) {
        console.error('Error syncing data to Supabase:', error);
      } else {
        console.log('Successfully synced data to Supabase:', key);
      }
    } catch (error) {
      console.error('Error in syncToSupabase:', error);
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
