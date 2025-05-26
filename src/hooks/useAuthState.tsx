
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const id = session?.user?.id || null;
      
      setIsAuthenticated(!!session);
      setUserId(id);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isAuth = !!session;
      setIsAuthenticated(isAuth);
      
      const newUserId = session?.user?.id || null;
      setUserId(newUserId);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAuthenticated, userId };
}
