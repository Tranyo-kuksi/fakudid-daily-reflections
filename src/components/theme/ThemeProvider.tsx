
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

// Updated gradient definitions with medium brightness colors
const themeGradients = {
  lavender: "linear-gradient(135deg, #dcd6f7 0%, #c4b9ed 100%)",
  mint: "linear-gradient(135deg, #e8f2dd 0%, #cde5c4 100%)",
  peach: "linear-gradient(135deg, #f9cfb3 0%, #eeb28e 100%)",
  sky: "linear-gradient(135deg, #b0e3ef 0%, #85d0e0 100%)",
  bubblegum: "linear-gradient(135deg, #f5b2d3 0%, #f07fb7 100%)",
  "golden-hour": "linear-gradient(135deg, #f8d675 0%, #f5c242 100%)" // Updated to more yellowish gold
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
        root.style.setProperty("--background", "260 30% 90%");  // Medium brightness
        root.style.background = themeGradients.lavender;
      } else if (themeToApply === "mint") {
        root.style.setProperty("--background", "152 20% 88%"); 
        root.style.background = themeGradients.mint;
      } else if (themeToApply === "peach") {
        root.style.setProperty("--background", "32 40% 84%");
        root.style.background = themeGradients.peach;
      } else if (themeToApply === "sky") {
        root.style.setProperty("--background", "190 60% 83%");
        root.style.background = themeGradients.sky;
      } else if (themeToApply === "bubblegum") {
        root.style.setProperty("--background", "340 70% 83%");
        root.style.background = themeGradients.bubblegum;
      } else if (themeToApply === "golden-hour") {
        root.style.setProperty("--background", "45 80% 70%"); // More yellowish, medium brightness
        root.style.background = themeGradients["golden-hour"];
      }
      
      // Apply fixed gradients to body
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.height = "100vh";
      document.body.style.margin = "0";
      
      // Now apply other theme-specific colors based on the selected theme
      switch (themeToApply) {
        case "lavender":
          root.style.setProperty("--primary", "260 50% 65%");
          root.style.setProperty("--accent", "326 50% 50%");
          break;
        case "mint":
          root.style.setProperty("--primary", "152 50% 55%");
          root.style.setProperty("--accent", "152 50% 45%");
          break;
        case "peach":
          root.style.setProperty("--primary", "32 70% 60%");
          root.style.setProperty("--accent", "6 50% 45%");
          break;
        case "sky":
          root.style.setProperty("--primary", "200 60% 65%");
          root.style.setProperty("--accent", "210 50% 50%");
          break;
        case "bubblegum":
          root.style.setProperty("--primary", "330 80% 70%");
          root.style.setProperty("--accent", "330 70% 55%");
          break;
        case "golden-hour":
          root.style.setProperty("--primary", "45 90% 65%"); // More yellowish gold
          root.style.setProperty("--accent", "45 85% 55%");
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
          root.style.setProperty("--background", "200 70% 12%");
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
            radial-gradient(2px 2px at 25% 75%, rgba(255,255,255,0.5) 1px, transparent 0),
            radial-gradient(2px 2px at 35% 85%, rgba(255,255,255,0.5) 1px, transparent 0),
            radial-gradient(2px 2px at 45% 55%, rgba(255,255,255,0.5) 1px, transparent 0),
            radial-gradient(2px 2px at 55% 90%, rgba(255,255,255,0.5) 1px, transparent 0),
            radial-gradient(2px 2px at 65% 70%, rgba(255,255,255,0.5) 1px, transparent 0),
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
