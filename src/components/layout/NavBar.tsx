
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Moon, Sun, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAllEntries } from "@/services/journalService";

export const NavBar = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [streak, setStreak] = useState(0);

  // Calculate actual streak based on journal entries
  useEffect(() => {
    const entries = getAllEntries();
    if (entries.length === 0) {
      setStreak(0);
      return;
    }

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Check if there's an entry for today
    const todayEntry = sortedEntries.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
    
    if (todayEntry) {
      currentStreak = 1;
      
      // Check for consecutive days before today
      let checkDate = new Date(today);
      
      for (let i = 1; i <= 365; i++) { // Check up to a year back
        checkDate.setDate(checkDate.getDate() - 1);
        
        const hasEntryForDate = sortedEntries.some(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === checkDate.getTime();
        });
        
        if (hasEntryForDate) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    setStreak(currentStreak);
  }, [location.pathname]); // Recalculate when changing pages

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold">FakUdid</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">{streak}</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
