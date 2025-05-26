
import { useState, useEffect } from 'react';
import { useAuthState } from './useAuthState';
import { useCloudSync } from './useCloudSync';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Define which keys should be synced to cloud storage
  const SYNC_KEYS = ['user-settings', 'user-preferences', 'journal-entries', 'journalEntries'];
  
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
  const { isAuthenticated, userId } = useAuthState();
  const { loadFromCloudStorage, syncToSupabaseStorage } = useCloudSync();

  // Load from cloud storage when authenticated
  useEffect(() => {
    const loadCloudData = async () => {
      if (userId && SYNC_KEYS.includes(key)) {
        const cloudData = await loadFromCloudStorage(userId, key);
        if (cloudData !== null) {
          setStoredValue(cloudData);
          
          // Also update localStorage for offline access
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(cloudData));
          }
        }
      }
    };
    
    loadCloudData();
  }, [userId, key]);

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
      
      // If we're authenticated, sync to Supabase Storage for synced keys
      if (isAuthenticated && userId && SYNC_KEYS.includes(key)) {
        syncToSupabaseStorage(userId, key, valueToStore);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
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
