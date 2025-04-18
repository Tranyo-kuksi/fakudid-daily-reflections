
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
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  lightTheme: "lavender",
  setLightTheme: () => null,
  darkTheme: "midnight",
  setDarkTheme: () => null
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Available theme options
const lightThemes = ["lavender", "mint", "peach", "sky"];
const darkThemes = ["midnight", "forest", "plum", "ocean"];

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

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme-related classes
    root.classList.remove("light", "dark");
    
    // Remove all theme classes
    const themeClasses = [
      "theme-lavender", "theme-mint", "theme-peach", "theme-sky",
      "theme-midnight", "theme-forest", "theme-plum", "theme-ocean"
    ];
    themeClasses.forEach(cls => root.classList.remove(cls));

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
    
    // Update CSS variables based on the selected theme
    if (mode === "light") {
      switch (lightTheme) {
        case "lavender":
          // Default lavender theme - no need to change variables
          break;
        case "mint":
          root.style.setProperty("--primary", "152 78% 75%");
          root.style.setProperty("--accent", "152 78% 60%");
          break;
        case "peach":
          root.style.setProperty("--primary", "32 95% 75%");
          root.style.setProperty("--accent", "6 78% 60%");
          break;
        case "sky":
          root.style.setProperty("--primary", "200 85% 75%");
          root.style.setProperty("--accent", "210 78% 60%");
          break;
        default:
          // Reset to default
          root.style.setProperty("--primary", "260 78% 75%");
          root.style.setProperty("--accent", "326 78% 60%");
      }
    } else {
      switch (darkTheme) {
        case "midnight":
          // Default midnight theme - no need to change variables
          break;
        case "forest":
          root.style.setProperty("--primary", "152 60% 60%");
          root.style.setProperty("--accent", "120 40% 50%");
          break;
        case "plum":
          root.style.setProperty("--primary", "300 60% 60%");
          root.style.setProperty("--accent", "326 78% 60%");
          break;
        case "ocean":
          root.style.setProperty("--primary", "200 60% 60%");
          root.style.setProperty("--accent", "210 78% 60%");
          break;
        default:
          // Reset to default
          root.style.setProperty("--primary", "260 78% 75%");
          root.style.setProperty("--accent", "326 78% 60%");
      }
    }
  }, [theme, lightTheme, darkTheme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    lightTheme,
    setLightTheme: (theme: string) => {
      if (lightThemes.includes(theme)) {
        localStorage.setItem("fakudid-light-theme", theme);
        setLightTheme(theme);
      }
    },
    darkTheme,
    setDarkTheme: (theme: string) => {
      if (darkThemes.includes(theme)) {
        localStorage.setItem("fakudid-dark-theme", theme);
        setDarkTheme(theme);
      }
    }
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
