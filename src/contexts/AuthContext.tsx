
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
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // When user signs in, sync journal data from Supabase
        if (event === 'SIGNED_IN' && session) {
          console.log("Auth context: User signed in, syncing journal data");
          setTimeout(async () => {
            try {
              await syncFromSupabase();
              console.log("Journal sync completed");
            } catch (error) {
              console.error("Error syncing journal on sign in:", error);
            }
          }, 100);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // On initial load, if user is authenticated, sync journal data
      if (session) {
        console.log("Auth context: Initial session found, syncing journal data");
        setTimeout(async () => {
          try {
            await syncFromSupabase();
            console.log("Initial journal sync completed");
          } catch (error) {
            console.error("Error syncing journal on initial load:", error);
          }
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
