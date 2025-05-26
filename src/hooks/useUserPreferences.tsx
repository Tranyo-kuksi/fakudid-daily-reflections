
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUserPreferences<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Check authentication status and load preferences
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const id = session?.user?.id || null;
      
      setIsAuthenticated(!!session);
      setUserId(id);
      
      if (id) {
        await loadFromStorage(id, key);
      } else {
        // Load from localStorage for offline access
        loadFromLocalStorage();
      }
    };
    
    checkAuthAndLoad();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isAuth = !!session;
      setIsAuthenticated(isAuth);
      
      const newUserId = session?.user?.id || null;
      setUserId(newUserId);
      
      if (isAuth && newUserId) {
        await loadFromStorage(newUserId, key);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [key]);
  
  const loadFromLocalStorage = () => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  };

  const loadFromStorage = async (uid: string, storageKey: string) => {
    try {
      const filePath = `json/${uid}/${storageKey}.json`;
      
      const { data, error } = await supabase.storage
        .from('user-files')
        .download(filePath);
      
      if (error) {
        console.log(`No data found in storage for ${storageKey}, using localStorage`);
        loadFromLocalStorage();
        return;
      }
      
      if (data) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        console.log(`✅ Loaded ${storageKey} from storage`);
        setStoredValue(parsed);
        
        // Also update localStorage for offline access
        localStorage.setItem(storageKey, text);
      }
    } catch (error) {
      console.error(`Error loading from storage for ${storageKey}:`, error);
      loadFromLocalStorage();
    }
  };

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Save to localStorage for offline access
      localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // If authenticated, sync to storage
      if (isAuthenticated && userId) {
        syncToStorage(userId, key, valueToStore);
      }
    } catch (error) {
      console.warn(`Error setting value for key "${key}":`, error);
    }
  };

  const syncToStorage = async (uid: string, storageKey: string, value: any) => {
    try {
      const filePath = `json/${uid}/${storageKey}.json`;
      
      const { error } = await supabase.storage
        .from('user-files')
        .upload(filePath, JSON.stringify(value, null, 2), {
          upsert: true,
          contentType: 'application/json',
        });
        
      if (error) {
        console.error('Error uploading to storage:', error);
      } else {
        console.log(`✅ Synced ${storageKey} to storage`);
      }
    } catch (error) {
      console.error('Error in syncToStorage:', error);
    }
  };

  return [storedValue, setValue];
}
