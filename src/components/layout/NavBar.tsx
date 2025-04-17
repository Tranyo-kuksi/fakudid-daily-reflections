
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

export const NavBar = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [streak, setStreak] = useState(0);

  // Simulate streak data - in a real app this would come from a database
  useEffect(() => {
    // Mock streak data
    setStreak(7);
  }, []);

  const navItems = [
    { path: "/", label: "Journal" },
    { path: "/history", label: "History" },
    { path: "/mood-tracker", label: "Mood Tracker" },
    { path: "/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-fakudid-purple">FakUdid</span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-fakudid-purple ${
                  location.pathname === item.path
                    ? "text-fakudid-purple"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
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
