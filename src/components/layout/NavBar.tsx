import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Moon, Sun, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAllEntries } from "@/services/journalService";
import { useNavbar } from "@/contexts/NavbarContext";

export const NavBar = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [streak, setStreak] = useState(0);
  const { streak: contextStreak } = useNavbar();

  // Calculate streak of consecutive days with journal entries
  useEffect(() => {
    const calculateStreak = async () => {
      try {
        const entries = await getAllEntries();
        if (!entries || entries.length === 0) {
          setStreak(0);
          return;
        }

        // Sort entries by date (most recent first)
        const sortedEntries = [...entries].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Check if there's an entry for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const mostRecentDate = new Date(sortedEntries[0].date);
        mostRecentDate.setHours(0, 0, 0, 0);
        
        // If the most recent entry is not from today, streak is 0
        if (mostRecentDate.getTime() !== today.getTime()) {
          setStreak(0);
          return;
        }

        // Count consecutive days
        let currentStreak = 1;
        let currentDate = today;

        for (let i = 1; i < sortedEntries.length; i++) {
          const entryDate = new Date(sortedEntries[i].date);
          entryDate.setHours(0, 0, 0, 0);
          
          // Expected previous day
          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() - 1);
          
          if (entryDate.getTime() === currentDate.getTime()) {
            currentStreak++;
          } else {
            break;
          }
        }

        setStreak(currentStreak);
      } catch (error) {
        console.error("Error calculating streak:", error);
        setStreak(0);
      }
    };

    calculateStreak();
  }, [location.pathname]);

  // Use the context streak if provided
  const displayStreak = contextStreak || streak;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold">FakUdid</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {displayStreak > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{displayStreak}</span>
            </div>
          )}
          
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
}
