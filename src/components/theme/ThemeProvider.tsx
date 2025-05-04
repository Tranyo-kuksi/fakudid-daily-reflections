
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  lightTheme: string;
  setLightTheme: (theme: string) => void;
  darkTheme: string;
  setDarkTheme: (theme: string) => void;
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  lightTheme: "lavender",
  setLightTheme: () => null,
  darkTheme: "midnight",
  setDarkTheme: () => null,
  isPremium: false,
  setIsPremium: () => null
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Available theme options - expanded for premium users
const lightThemes = ["lavender", "mint", "peach", "sky"];
const premiumLightThemes = ["pink", "starry", "sunset", "rainbow"];
const darkThemes = ["midnight", "forest", "plum", "ocean"];
const premiumDarkThemes = ["nebula", "aurora", "cosmic", "void"];

// Gradient definitions for proper display
const themeGradients = {
  lavender: "linear-gradient(135deg, #bc7bed 0%, #9b65c7 100%)",
  mint: "linear-gradient(135deg, #c2fcdf 0%, #92dbb7 100%)",
  peach: "linear-gradient(135deg, #fcd4b1 0%, #f5b086 100%)",
  sky: "linear-gradient(135deg, #a2f1fa 0%, #79d8e6 100%)",
  // Premium light themes
  pink: "linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%)",
  starry: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDAiPjxkZWZzPjxyYWRpYWxHcmFkaWVudCBpZD0icmFkR3JhZCIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNTAlIiBmeD0iNTAlIiBmeT0iNTAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSJ3aGl0ZSIgc3RvcC1vcGFjaXR5PSIuNSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0id2hpdGUiIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNiZGM1ZjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxIiBmaWxsPSJ1cmwoI3JhZEdyYWQpIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTIwIiByPSIxLjUiIGZpbGw9InVybCgjcmFkR3JhZCkiLz48Y2lyY2xlIGN4PSIyOTAiIGN5PSI5MCIgcj0iMSIgZmlsbD0idXJsKCNyYWRHcmFkKSIvPjxjaXJjbGUgY3g9IjQzMCIgY3k9IjE1MCIgcj0iMS41IiBmaWxsPSJ1cmwoI3JhZEdyYWQpIi8+PGNpcmNsZSBjeD0iNjAwIiBjeT0iNzAiIHI9IjEiIGZpbGw9InVybCgjcmFkR3JhZCkiLz48Y2lyY2xlIGN4PSI3MDAiIGN5PSIxOTAiIHI9IjEuNSIgZmlsbD0idXJsKCNyYWRHcmFkKSIvPjxjaXJjbGUgY3g9IjkwMCIgY3k9IjgwIiByPSIxIiBmaWxsPSJ1cmwoI3JhZEdyYWQpIi8+PGNpcmNsZSBjeD0iMTIwIiBjeT0iMzAwIiByPSIxIiBmaWxsPSJ1cmwoI3JhZEdyYWQpIi8+PGNpcmNsZSBjeD0iMjMwIiBjeT0iMzkwIiByPSIxLjUiIGZpbGw9InVybCgjcmFkR3JhZCkiLz48Y2lyY2xlIGN4PSI1MDAiIGN5PSIzMDAiIHI9IjEiIGZpbGw9InVybCgjcmFkR3JhZCkiLz48Y2lyY2xlIGN4PSI3MDAiIGN5PSIzNTAiIHI9IjEuNSIgZmlsbD0idXJsKCNyYWRHcmFkKSIvPjxjaXJjbGUgY3g9IjgzMCIgY3k9IjQwMCIgcj0iMSIgZmlsbD0idXJsKCNyYWRHcmFkKSIvPjwvc3ZnPg=='), linear-gradient(135deg, #bdc5f0 0%, #9eadf0 100%)",
  sunset: "linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)",
  rainbow: "linear-gradient(to right, #fc5c7d, #6a82fb)",
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "fakudid-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [lightTheme, setLightTheme] = useState<string>(
    () => localStorage.getItem("fakudid-light-theme") || "lavender"
  );
  
  const [darkTheme, setDarkTheme] = useState<string>(
    () => localStorage.getItem("fakudid-dark-theme") || "midnight"
  );
  
  const [isPremium, setIsPremium] = useState<boolean>(
    () => localStorage.getItem("fakudid-premium") === "true"
  );

  useEffect(() => {
    localStorage.setItem("fakudid-premium", isPremium ? "true" : "false");
  }, [isPremium]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme-related classes
    root.classList.remove("light", "dark");
    
    // Remove all theme classes
    const allThemeClasses = [
      "theme-lavender", "theme-mint", "theme-peach", "theme-sky",
      "theme-midnight", "theme-forest", "theme-plum", "theme-ocean",
      "theme-pink", "theme-starry", "theme-sunset", "theme-rainbow",
      "theme-nebula", "theme-aurora", "theme-cosmic", "theme-void"
    ];
    allThemeClasses.forEach(cls => root.classList.remove(cls));

    // Determine which mode to use (light or dark)
    let mode: "light" | "dark";
    if (theme === "system") {
      mode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      mode = theme;
    }
    
    // Add the mode class
    root.classList.add(mode);
    
    // Add the appropriate theme class
    const themeToApply = mode === "dark" ? darkTheme : lightTheme;
    root.classList.add(`theme-${themeToApply}`);
    
    // Apply theme CSS variables
    if (mode === "light") {
      // Reset default variables first
      root.style.removeProperty("--primary");
      root.style.removeProperty("--accent");
      
      // Set the background gradient directly on the document root element
      // This is crucial for the gradients to be visible
      if (themeToApply === "lavender") {
        root.style.setProperty("--background", "240 30% 97%");  
        root.style.background = themeGradients.lavender;
      } else if (themeToApply === "mint") {
        root.style.setProperty("--background", "152 20% 96%"); 
        root.style.background = themeGradients.mint;
      } else if (themeToApply === "peach") {
        root.style.setProperty("--background", "32 20% 96%");
        root.style.background = themeGradients.peach;
      } else if (themeToApply === "sky") {
        root.style.setProperty("--background", "200 20% 96%");
        root.style.background = themeGradients.sky;
      } 
      // Premium light themes
      else if (themeToApply === "pink") {
        root.style.setProperty("--background", "340 100% 97%");
        root.style.background = themeGradients.pink;
      } else if (themeToApply === "starry") {
        root.style.setProperty("--background", "230 40% 90%");
        root.style.background = themeGradients.starry;
      } else if (themeToApply === "sunset") {
        root.style.setProperty("--background", "35 100% 93%");
        root.style.background = themeGradients.sunset;
      } else if (themeToApply === "rainbow") {
        root.style.setProperty("--background", "260 100% 96%");
        root.style.background = themeGradients.rainbow;
      }
      
      // Apply more pronounced gradients that are more visible
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.height = "100vh";
      document.body.style.margin = "0";
      
      // Now apply other theme-specific colors based on the selected theme
      switch (themeToApply) {
        case "lavender":
          root.style.setProperty("--primary", "260 50% 70%");
          root.style.setProperty("--accent", "326 50% 55%");
          break;
        case "mint":
          root.style.setProperty("--primary", "152 50% 60%");
          root.style.setProperty("--accent", "152 50% 50%");
          break;
        case "peach":
          root.style.setProperty("--primary", "32 70% 65%");
          root.style.setProperty("--accent", "6 50% 55%");
          break;
        case "sky":
          root.style.setProperty("--primary", "200 60% 65%");
          root.style.setProperty("--accent", "210 50% 55%");
          break;
        // Premium themes
        case "pink":
          root.style.setProperty("--primary", "340 80% 65%");
          root.style.setProperty("--accent", "320 70% 50%");
          break;
        case "starry":
          root.style.setProperty("--primary", "230 60% 70%");
          root.style.setProperty("--accent", "260 70% 65%");
          break;
        case "sunset":
          root.style.setProperty("--primary", "25 100% 60%");
          root.style.setProperty("--accent", "5 90% 60%");
          break;
        case "rainbow":
          root.style.setProperty("--primary", "300 80% 60%");
          root.style.setProperty("--accent", "220 90% 60%");
          break;
      }
    } else {
      // Reset default variables first
      root.style.removeProperty("--primary");
      root.style.removeProperty("--accent");
      root.style.removeProperty("background");
      
      // Apply dark theme variables
      switch (darkTheme) {
        case "midnight":
          root.style.setProperty("--background", "240 10% 8%");
          root.style.setProperty("--primary", "260 78% 75%");
          root.style.setProperty("--accent", "326 78% 60%");
          break;
        case "forest":
          root.style.setProperty("--background", "150 30% 10%");
          root.style.setProperty("--primary", "152 60% 60%");
          root.style.setProperty("--accent", "120 40% 50%");
          break;
        case "plum":
          root.style.setProperty("--background", "300 30% 10%");
          root.style.setProperty("--primary", "300 60% 60%");
          root.style.setProperty("--accent", "326 78% 60%");
          break;
        case "ocean":
          root.style.setProperty("--background", "200 70% 8%");
          root.style.setProperty("--primary", "200 60% 60%");
          root.style.setProperty("--accent", "210 78% 60%");
          break;
        // Premium dark themes
        case "nebula":
          root.style.setProperty("--background", "280 50% 7%");
          root.style.setProperty("--primary", "280 70% 65%");
          root.style.setProperty("--accent", "320 80% 60%");
          break;
        case "aurora":
          root.style.setProperty("--background", "160 50% 7%");
          root.style.setProperty("--primary", "160 70% 50%");
          root.style.setProperty("--accent", "120 80% 50%");
          break;
        case "cosmic":
          root.style.setProperty("--background", "220 60% 7%");
          root.style.setProperty("--primary", "220 70% 60%");
          root.style.setProperty("--accent", "260 80% 60%");
          break;
        case "void":
          root.style.setProperty("--background", "0 0% 5%");
          root.style.setProperty("--primary", "0 0% 70%");
          root.style.setProperty("--accent", "0 0% 50%");
          break;
      }
    }
    
    // Force a repaint to ensure theme changes are applied consistently
    document.body.style.display = 'none';
    document.body.offsetHeight; // Trigger a reflow
    document.body.style.display = '';
    
    console.log(`Applied theme: ${mode} - ${themeToApply}`);
  }, [theme, lightTheme, darkTheme]);

  // Get all available themes based on premium status
  const getAllLightThemes = () => {
    return isPremium ? [...lightThemes, ...premiumLightThemes] : lightThemes;
  };
  
  const getAllDarkThemes = () => {
    return isPremium ? [...darkThemes, ...premiumDarkThemes] : darkThemes;
  };

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    lightTheme,
    setLightTheme: (theme: string) => {
      const availableThemes = getAllLightThemes();
      if (availableThemes.includes(theme)) {
        localStorage.setItem("fakudid-light-theme", theme);
        setLightTheme(theme);
      }
    },
    darkTheme,
    setDarkTheme: (theme: string) => {
      const availableThemes = getAllDarkThemes();
      if (availableThemes.includes(theme)) {
        localStorage.setItem("fakudid-dark-theme", theme);
        setDarkTheme(theme);
      }
    },
    isPremium,
    setIsPremium
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
