
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Moon, Sun, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const NavBar = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [streak, setStreak] = useState(0);

  // Simulate streak data - in a real app this would come from a database
  useEffect(() => {
    // Mock streak data
    setStreak(7);
  }, []);

  // Page titles
  const getPageTitle = (path: string) => {
    switch (path) {
      case "/":
        return "My Journal";
      case "/history":
        return "Journal History";
      case "/mood-tracker":
        return "Mood Tracker";
      case "/customize":
        return "Customize Your Journal";
      case "/settings":
        return "Settings";
      default:
        return "FakUdid";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold">{getPageTitle(location.pathname)}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">{streak} day streak</span>
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
