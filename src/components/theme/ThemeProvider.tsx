
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
    
    // Apply theme CSS variables and gradients
    if (mode === "light") {
      // Reset all previous styles first
      root.style.removeProperty("--primary");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--background");
      
      // Apply the gradient as a direct background style
      if (themeToApply === "lavender") {
        document.body.style.background = themeGradients.lavender;
        document.body.style.backgroundAttachment = "fixed";
        root.style.setProperty("--primary", "260 50% 70%");
        root.style.setProperty("--accent", "326 50% 55%");
      } else if (themeToApply === "mint") {
        document.body.style.background = themeGradients.mint;
        document.body.style.backgroundAttachment = "fixed";
        root.style.setProperty("--primary", "152 50% 60%");
        root.style.setProperty("--accent", "152 50% 50%");
      } else if (themeToApply === "peach") {
        document.body.style.background = themeGradients.peach;
        document.body.style.backgroundAttachment = "fixed";
        root.style.setProperty("--primary", "32 70% 65%");
        root.style.setProperty("--accent", "6 50% 55%");
      } else if (themeToApply === "sky") {
        document.body.style.background = themeGradients.sky;
        document.body.style.backgroundAttachment = "fixed";
        root.style.setProperty("--primary", "200 60% 65%");
        root.style.setProperty("--accent", "210 50% 55%");
      }
      
    } else {
      // Reset body background for dark mode
      document.body.style.removeProperty("background");
      document.body.style.removeProperty("backgroundAttachment");
      
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
