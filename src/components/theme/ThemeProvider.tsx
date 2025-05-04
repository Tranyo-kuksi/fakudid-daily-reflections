
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
const premiumLightThemes = [
  "cosmos-light", "zen-garden", "retro-pop", "city-lights", 
  "golden-hour", "mindspace", "forest-retreat"
];

const darkThemes = ["midnight", "forest", "plum", "ocean"];
const premiumDarkThemes = [
  "cosmos", "zen-garden", "retro-pop", "city-lights", 
  "golden-hour", "mindspace", "forest-retreat"
];

// Gradient definitions for proper display
const themeGradients = {
  // Base themes
  lavender: "linear-gradient(135deg, #bc7bed 0%, #9b65c7 100%)",
  mint: "linear-gradient(135deg, #c2fcdf 0%, #92dbb7 100%)",
  peach: "linear-gradient(135deg, #fcd4b1 0%, #f5b086 100%)",
  sky: "linear-gradient(135deg, #a2f1fa 0%, #79d8e6 100%)",
  
  // Premium light themes
  "cosmos-light": "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDgwMCI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggZD0iTTc2OSAyMjlMMTAzNyAyNjAuOU05MjcgODgwTDczMSA3MzcgNTIwIDY2MCAzMDkgNTM4IDQwIDU5OSAyOTUgNzY0IDEyNi41IDg3OS41IDQwIDU5OS0xOTcgNDkzIDEwMiAzODItMzEgMjI5IDEyNi41IDc5LjUtNjktNjMiLz48cGF0aCBkPSJNLTMxIDIyOUwyMzcgMjYxIDM5MCAzODIgNjAzIDQ5MyAzMDguNSA1MzcuNSAxMDEuNSAzODEuNU0zNzAgOTA1TDI5NSA3NjQiLz48cGF0aCBkPSJNNTIwIDY2MEw1NzggODQyIDczMSA3MzcgODQwIDU5OSA2MDMgNDkzIDUyMCA2NjAgMjk1IDc2NCAzMDkgNTM4IDM5MCAzODIgNTM5IDI2OSA3NjkgMjI5IDU3Ny41IDQxLjUgMzcwIDEwNSAyOTUgLTM2IDEyNi41IDc5LjUgMjM3IDI2MSAxMDIgMzgyIDQwIDU5OSAtNjkgNzM3IDEyNyA4ODAiLz48cGF0aCBkPSJNNTIwLTE0MEw1NzguNSA0Mi41IDczMS02M002MDMgNDkzTDUzOSAyNjkgMjM3IDI2MSAzNzAgMTA1TTkwMiAzODJMNTM5IDI2OU0zOTAgMzgyTDEwMiAzODIiLz48cGF0aCBkPSJNLTIyMiA0MkwxMjYuNSA3OS41IDM3MCAxMDUgNTM5IDI2OSA1NzcuNSA0MS41IDkyNyA4MCA3NjkgMjI5IDkwMiAzODIgNjAzIDQ5MyA3MzEgNzM3TTI5NS0zNkw1NzcuNSA0MS41TTU3OCA4NDJMMJK1IDc2NE00MC0yMDFMMTI3IDgwTTEwMiAzODJMLTI2MSAyNjkiLz48L2c+PGcgZmlsbD0iI2RkZCI+PGNpcmNsZSBjeD0iNzY5IiBjeT0iMjI5IiByPSIzIi8+PGNpcmNsZSBjeD0iNTM5IiBjeT0iMjY5IiByPSIzIi8+PGNpcmNsZSBjeD0iNjAzIiBjeT0iNDkzIiByPSI1Ii8+PGNpcmNsZSBjeD0iNzMxIiBjeT0iNzM3IiByPSIzIi8+PGNpcmNsZSBjeD0iNTIwIiBjeT0iNjYwIiByPSIzIi8+PGNpcmNsZSBjeD0iMzA5IiBjeT0iNTM4IiByPSIzIi8+PGNpcmNsZSBjeD0iMjk1IiBjeT0iNzY0IiByPSIzIi8+PGNpcmNsZSBjeD0iNDAiIGN5PSI1OTkiIHI9IjUiLz48Y2lyY2xlIGN4PSIxMDIiIGN5PSIzODIiIHI9IjUiLz48Y2lyY2xlIGN4PSIxMjciIGN5PSI4MCIgcj0iMyIvPjxjaXJjbGUgY3g9IjM3MCIgY3k9IjEwNSIgcj0iMyIvPjxjaXJjbGUgY3g9IjU3OCIgY3k9IjQyIiByPSI1Ii8+PGNpcmNsZSBjeD0iMjM3IiBjeT0iMjYxIiByPSIzIi8+PGNpcmNsZSBjeD0iMzkwIiBjeT0iMzgyIiByPSIzIi8+PC9nPjwvc3ZnPg=='), linear-gradient(135deg, #e5d7f5 0%, #d0c1e7 100%)",
  "zen-garden": "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzIwJyB2aWV3Qm94PScwIDAgMTAwIDIwJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxwYXRoIGQ9J00yMS4xODQgMjBjLjM1Ny0uMTMuNzItLjI2NC44ODgtLjE0IDEuODU0LjI0MyAzLjU1NC41NiA1LjcxNC41NiAxNy4wNTMgMCAxNy44MjUtMjAgMzUuMzkzLTIwIDkuMzYzIDAgMTMuNzQ2IDEwLjI5MiAxNS44MDUgMTYuMjUnIGZpbGw9J25vbmUnIHN0cm9rZT0nI2IzZDFhNScgc3Ryb2tlLXdpZHRoPScxJy8+PHBhdGggZD0nTTIxLjE4NCAyMGMuMzU3LS4xMy43Mi0uMjY0Ljg4OC0uMTQgMS44NTQuMjQzIDMuNTU0LjU2IDUuNzE0LjU2IDE3LjA1MyAwIDE3LjgyNS0yMCAzNS4zOTMtMjAgOS4zNjMgMCAxMy43NDYgMTAuMjkyIDE1LjgwNSAxNi4yNScgZmlsbD0nbm9uZScgc3Ryb2tlPScjY2ZkZmMyJyBzdHJva2Utd2lkdGg9JzEnIHN0cm9rZS1kYXNoYXJyYXk9JzMsMicvPjwvc3ZnPg=='), linear-gradient(135deg, #e8f3e2 0%, #cfdfc2 100%)",
  "retro-pop": "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjAnIGhlaWdodD0nNjAnIHZpZXdCb3g9JzAgMCA2MCA2MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPjxnIGZpbGw9JyNmZjcxY2UnIGZpbGwtb3BhY2l0eT0nMC4yJz48cGF0aCBkPSdNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnonLz48L2c+PC9nPjwvc3ZnPg=='), linear-gradient(135deg, #fffcef 0%, #ffeffa 100%)",
  "city-lights": "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MDAnIGhlaWdodD0nMjAwJyB2aWV3Qm94PScwIDAgMTYwIDgwJz48ZyBmaWxsPScjMDIyYjQ5JyBmaWxsLW9wYWNpdHk9JzAuMSc+PHBvbHlnb24gcG9pbnRzPScwIDEwIDAgMCAxMCAwJy8+PHBvbHlnb24gcG9pbnRzPScwIDQwIDAgMzAgMTAgMzAnLz48cG9seWdvbiBwb2ludHM9JzAgMzAgMCAyMCAxMCAyMCcvPjxwb2x5Z29uIHBvaW50cz0nMCA3MCAwIDYwIDEwIDYwJy8+PHBvbHlnb24gcG9pbnRzPScwIDgwIDAgNzAgMTAgNzAnLz48cG9seWdvbiBwb2ludHM9JzUwIDgwIDUwIDcwIDYwIDcwJy8+PHBvbHlnb24gcG9pbnRzPScxMCAyMCAxMCAxMCAyMCAxMCcvPjxwb2x5Z29uIHBvaW50cz0nMTAgNDAgMTAgMzAgMjAgMzAnLz48cG9seWdvbiBwb2ludHM9JzIwIDEwIDIwIDAgMzAgMCcvPjxwb2x5Z29uIHBvaW50cz0nMTAgMTAgMTAgMCAyMCAwJy8+PHBvbHlnb24gcG9pbnRzPSczMCAyMCAzMCAxMCA0MCAxMCcvPjxwb2x5Z29uIHBvaW50cz0nMjAgMjAgMjAgNDAgNDAgMjAnLz48cG9seWdvbiBwb2ludHM9JzQwIDEwIDQwIDAgNTAgMCcvPjxwb2x5Z29uIHBvaW50cz0nNDAgMjAgNDAgMTAgNTAgMTAnLz48cG9seWdvbiBwb2ludHM9JzQwIDQwIDQwIDMwIDUwIDMwJy8+PHBvbHlnb24gcG9pbnRzPSczMCA0MCAzMCAzMCA0MCAzMCcvPjxwb2x5Z29uIHBvaW50cz0nNDAgNjAgNDAgNTAgNTAgNTAnLz48cG9seWdvbiBwb2ludHM9JzUwIDMwIDUwIDIwIDYwIDIwJy8+PHBvbHlnb24gcG9pbnRzPSc0MCA2MCA0MCA4MCA2MCA2MCcvPjxwb2x5Z29uIHBvaW50cz0nNTAgNDAgNTAgNjAgNzAgNDAnLz48cG9seWdvbiBwb2ludHM9JzYwIDAgNjAgMjAgODAgMCcvPjxwb2x5Z29uIHBvaW50cz0nNzAgMzAgNzAgMjAgODAgMjAnLz48cG9seWdvbiBwb2ludHM9JzcwIDQwIDcwIDMwIDgwIDMwJy8+PHBvbHlnb24gcG9pbnRzPSc2MCA2MCA2MCA4MCA4MCA2MCcvPjxwb2x5Z29uIHBvaW50cz0nODAgMTAgODAgMCA5MCAwJy8+PHBvbHlnb24gcG9pbnRzPSc3MCA0MCA3MCA2MCA5MCA0MCcvPjxwb2x5Z29uIHBvaW50cz0nODAgNjAgODAgODAgOTAgODAgMTAwIDcwJy8+PHBvbHlnb24gcG9pbnRzPSc4MCAxMCA4MCA0MCAxMTAgMTAnLz48cG9seWdvbiBwb2ludHM9JzExMCA0MCAxMTAgMzAgMTIwIDMwJy8+PHBvbHlnb24gcG9pbnRzPSc5MCA0MCA5MCA3MCAxMjAgNDAnLz48cG9seWdvbiBwb2ludHM9JzEwIDUwIDEwIDgwIDQwIDUwJy8+PHBvbHlnb24gcG9pbnRzPScxMTAgNjAgMTEwIDgwIDEzMCA4MCAxNDAgNzAnLz48cG9seWdvbiBwb2ludHM9JzEzMCA4MCAxMzAgNzAgMTQwIDcwJy8+PC9nPjwvc3ZnPg=='), linear-gradient(135deg, #e8ebf2 0%, #d9e1f2 100%)",
  "golden-hour": "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgdmlld0JveD0nMCAwIDEwMCAxMDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZD0nTTExIDE4YzMuODY2IDAgNy0zLjEzNCA3LTdzLTMuMTM0LTctNy03LTcgMy4xMzQtNyA3IDMuMTM0IDcgNyA3em00OCAyNWMzLjg2NiAwIDctMy4xMzQgNy03cy0zLjEzNC03LTctNy03IDMuMTM0LTcgNyAzLjEzNCA3IDcgN3ptLTQzLTdjMS42NTcgMCAzLTEuMzQzIDMtM3MtMS4zNDMtMy0zLTMtMyAxLjM0My0zIDMgMS4zNDMgMyAzIDN6bTYzIDMxYzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzek0zNCA5MGMxLjY1NyAwIDMtMS4zNDMgMy0zcy0xLjM0My0zLTMtMy0zIDEuMzQzLTMgMyAxLjM0MyAzIDMgM3ptNTYtNzZjMS42NTcgMCAzLTEuMzQzIDMtM3MtMS4zNDMtMy0zLTMtMyAxLjM0My0zIDMgMS4zNDMgMyAzIDN6TTEyIDg2YzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMjgtNjVjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0yMy0xMWMyLjc2IDAgNS0yLjI0IDUtNXMtMi4yNC01LTUtNS01IDIuMjQtNSA1IDIuMjQgNSA1IDV6bS02IDYwYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMjkgMjJjMi43NiAwIDUtMi4yNCA1LTVzLTIuMjQtNS01LTUtNSAyLjI0LTUgNSAyLjI0IDUgNSA1ek0zMiA2M2MyLjc2IDAgNS0yLjI0IDUtNXMtMi4yNC01LTUtNS01IDIuMjQtNSA1IDIuMjQgNSA1IDV6bTU3LTEzYzIuNzYgMCA1LTIuMjQgNS01cy0yLjI0LTUtNS01LTUgMi4yNC01IDUgMi4yNCA1IDUgNXptLTktMjFjMS4xMDUgMCAyLS44OTUgMi0ycy0uODk1LTItMi0yLTIgLjg5NS0yIDIgLjg5NSAyIDIgMnpNNjAgOTFjMS4xMDUgMCAyLS44OTUgMi0ycy0uODk1LTItMi0yLTIgLjg5NS0yIDIgLjg5NSAyIDIgMnpNMzUgNDFjMS4xMDUgMCAyLS44OTUgMi0ycy0uODk1LTItMi0yLTIgLjg5NS0yIDIgLjg5NSAyIDIgMnpNMTIgNjBjMS4xMDUgMCAyLS44OTUgMi0ycy0uODk1LTItMi0yLTIgLjg5NS0yIDIgLjg5NSAyIDIgMnonIGZpbGw9JyNmZGJhNzQnIGZpbGwtb3BhY2l0eT0nMC4xJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnLz48L3N2Zz4='), linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)",
  "mindspace": "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIHZpZXdCb3g9JzAgMCAyMCAyMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZyBmaWxsPScjNjM2NmYxJyBmaWxsLW9wYWNpdHk9JzAuMDUnIGZpbGwtcnVsZT0nZXZlbm9kZCc+PGNpcmNsZSBjeD0nMycgY3k9JzMnIHI9JzMnLz48Y2lyY2xlIGN4PScxMycgY3k9JzEzJyByPSczJy8+PC9nPjwvc3ZnPg=='), linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%)",
  "forest-retreat": "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNTInIGhlaWdodD0nMjYnIHZpZXdCb3g9JzAgMCA1MiAyNicgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPjxnIGZpbGw9JyM0ZDdjMGYnIGZpbGwtb3BhY2l0eT0nMC4wNSc+PHBhdGggZD0nTTEwIDEwYzAtMi4yMS0xLjc5LTQtNC00LTMuMzE0IDAtNi0yLjY4Ni02LTZoMmMwIDIuMjEgMS43OSA0IDQgNCAzLjMxNCAwIDYgMi42ODYgNiA2IDAgMi4yMSAxLjc5IDQgNCA0IDMuMzE0IDAgNiAyLjY4NiA2IDYgMCAyLjIxIDEuNzkgNCA0IDR2MmMtMy4zMTQgMC02LTIuNjg2LTYtNiAwLTIuMjEtMS43OS00LTQtNC0zLjMxNCAwLTYtMi42ODYtNi02em0yNS40NjQtMS45NWw4LjQ4NiA4LjQ4Ni0xLjQxNCAxLjQxNC04LjQ4Ni04LjQ4NiAxLjQxNC0xLjQxNHonIC8+PC9nPjwvZz48L3N2Zz4='), linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)"
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
      // Base themes
      "theme-lavender", "theme-mint", "theme-peach", "theme-sky",
      "theme-midnight", "theme-forest", "theme-plum", "theme-ocean",
      // Premium themes - light versions
      "theme-cosmos-light", "theme-zen-garden", "theme-retro-pop", 
      "theme-city-lights", "theme-golden-hour", "theme-mindspace", 
      "theme-forest-retreat",
      // Premium themes - dark versions
      "theme-cosmos", "theme-zen-garden", "theme-retro-pop", 
      "theme-city-lights", "theme-golden-hour", "theme-mindspace", 
      "theme-forest-retreat",
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
    
    // For dark mode premium themes, we don't need the "-light" suffix
    const themeClass = mode === "light" && themeToApply.includes("-light") 
      ? themeToApply 
      : (mode === "dark" && themeToApply.includes("-light"))
        ? themeToApply.replace("-light", "")
        : themeToApply;
        
    root.classList.add(`theme-${themeClass}`);
    
    // Reset any background styles
    root.style.removeProperty("--primary");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--background");
    root.style.background = "";
    
    // Apply premium theme backgrounds for light mode
    if (mode === "light" && themeGradients[themeToApply]) {
      root.style.background = themeGradients[themeToApply];
    }

    // Apply the same fixed background behavior
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.height = "100vh";
    document.body.style.margin = "0";
    
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
