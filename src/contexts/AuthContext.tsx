
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { syncFromSupabase } from "@/services/journalService";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null,
  signOut: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // When user signs in, sync data from Supabase
        if (event === 'SIGNED_IN') {
          console.log("Auth context: User signed in, syncing data");
          try {
            await syncFromSupabase();
          } catch (error) {
            console.error("Error syncing on sign in:", error);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // On initial load, if user is authenticated, sync data
      if (session && !initialSyncDone) {
        console.log("Auth context: Initial session found, syncing data");
        try {
          await syncFromSupabase();
          setInitialSyncDone(true);
        } catch (error) {
          console.error("Error syncing on initial load:", error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [initialSyncDone]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, session, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
