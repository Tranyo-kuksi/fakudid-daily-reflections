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
const lightThemes = ["lavender", "mint", "peach", "sky", "bubblegum", "golden-hour"];
const darkThemes = ["midnight", "forest", "plum", "ocean", "cosmos", "molten"];

// Gradient definitions for proper display
const themeGradients = {
  lavender: "linear-gradient(135deg, #d1c3f5 0%, #a98de2 100%)",
  mint: "linear-gradient(135deg, #d0ebbd 0%, #a3cea0 100%)",
  peach: "linear-gradient(135deg, #f5b086 0%, #e08a58 100%)",
  sky: "linear-gradient(135deg, #89d9e8 0%, #5ab0c0 100%)",
  bubblegum: "linear-gradient(135deg, #f8c1d3 0%, #e698b5 100%)",
  "golden-hour": "linear-gradient(135deg, #e0a77a 0%, #c28c62 100%)"
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
      "theme-midnight", "theme-forest", "theme-plum", "theme-ocean",
      "theme-bubblegum", "theme-cosmos", "theme-golden-hour", "theme-molten"
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
      
      // Set the background gradient directly on the document root element
      // This is crucial for the gradients to be visible
      if (themeToApply === "lavender") {
        root.style.setProperty("--background", "260 40% 90%");  // Fallback for components using HSL
        root.style.background = themeGradients.lavender;
      } else if (themeToApply === "mint") {
        root.style.setProperty("--background", "152 30% 85%"); 
        root.style.background = themeGradients.mint;
      } else if (themeToApply === "peach") {
        root.style.setProperty("--background", "32 60% 80%");
        root.style.background = themeGradients.peach;
      } else if (themeToApply === "sky") {
        root.style.setProperty("--background", "187 50% 80%");
        root.style.background = themeGradients.sky;
      } else if (themeToApply === "bubblegum") {
        root.style.setProperty("--background", "350 60% 85%");
        root.style.background = themeGradients.bubblegum;
      } else if (themeToApply === "golden-hour") {
        root.style.setProperty("--background", "35 50% 80%");
        root.style.background = themeGradients["golden-hour"];
      }
      
      // Apply fixed gradients to body
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
        case "bubblegum":
          root.style.setProperty("--primary", "350 100% 78%");
          root.style.setProperty("--accent", "350 80% 65%");
          break;
        case "golden-hour":
          root.style.setProperty("--primary", "45 100% 50%");
          root.style.setProperty("--accent", "280 50% 75%");
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
          root.style.setProperty("--background", "200 70% 15%");
          root.style.setProperty("--primary", "200 60% 60%");
          root.style.setProperty("--accent", "210 78% 60%");
          break;
        case "cosmos":
          // Add star-like pattern for cosmos theme
          root.style.setProperty("--background", "250 40% 12%");
          root.style.setProperty("--primary", "260 60% 70%");
          root.style.setProperty("--accent", "230 80% 65%");
          
          // Create a star background effect
          const starsBackground = `
            radial-gradient(1px 1px at 10% 10%, white 1px, transparent 0),
            radial-gradient(1px 1px at 20% 30%, white 1px, transparent 0),
            radial-gradient(1px 1px at 30% 10%, white 1px, transparent 0),
            radial-gradient(1px 1px at 40% 40%, white 1px, transparent 0),
            radial-gradient(1px 1px at 50% 15%, white 1px, transparent 0),
            radial-gradient(1px 1px at 60% 25%, white 1px, transparent 0),
            radial-gradient(1px 1px at 70% 5%, white 1px, transparent 0),
            radial-gradient(1px 1px at 80% 35%, white 1px, transparent 0),
            radial-gradient(1px 1px at 90% 20%, white 1px, transparent 0),
            radial-gradient(1px 1px at 95% 45%, white 1px, transparent 0),
            radial-gradient(1px 1px at 5% 45%, white 1px, transparent 0),
            radial-gradient(1px 1px at 15% 65%, white 1px, transparent 0),
            radial-gradient(2px 2px at 25% 75%, rgba(255,255,255,0.7) 1px, transparent 0),
            radial-gradient(2px 2px at 35% 85%, rgba(255,255,255,0.7) 1px, transparent 0),
            radial-gradient(2px 2px at 45% 55%, rgba(255,255,255,0.7) 1px, transparent 0),
            radial-gradient(2px 2px at 55% 90%, rgba(255,255,255,0.7) 1px, transparent 0),
            radial-gradient(2px 2px at 65% 70%, rgba(255,255,255,0.7) 1px, transparent 0),
            radial-gradient(2px 2px at 75% 15%, rgba(255,255,255,0.7) 1px, transparent 0),
            radial-gradient(2px 2px at 85% 35%, rgba(255,255,255,0.7) 1px, transparent 0),
            linear-gradient(135deg, #1A1F2C 0%, #2c3e50 100%)
          `;
          root.style.background = starsBackground;
          break;
        case "molten":
          root.style.setProperty("--background", "0 60% 8%");
          root.style.setProperty("--primary", "16 100% 50%");
          root.style.setProperty("--accent", "30 100% 50%");
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
