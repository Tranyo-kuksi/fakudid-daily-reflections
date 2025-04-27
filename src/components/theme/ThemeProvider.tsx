
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

// Gradient definitions for proper display
const themeGradients = {
  lavender: "linear-gradient(135deg, #bc7bed 0%, #9b65c7 100%)",
  mint: "linear-gradient(135deg, #c2fcdf 0%, #92dbb7 100%)",
  peach: "linear-gradient(135deg, #fcd4b1 0%, #f5b086 100%)",
  sky: "linear-gradient(135deg, #a2f1fa 0%, #79d8e6 100%)"
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
    
    // Apply theme CSS variables
    if (mode === "light") {
      // Reset default variables first
      root.style.removeProperty("--primary");
      root.style.removeProperty("--accent");
      
      // Important: Set background as an actual style property for gradients
      if (themeToApply === "lavender") {
        root.style.setProperty("--background", "240 30% 97%");  // Fallback for components using HSL
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
      }
    }
    
    // Force a repaint to ensure theme changes are applied consistently
    document.body.style.display = 'none';
    document.body.offsetHeight; // Trigger a reflow
    document.body.style.display = '';
    
    console.log(`Applied theme: ${mode} - ${themeToApply}`);
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
