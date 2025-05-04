
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export default function CustomizePage() {
  const { 
    theme, 
    setTheme, 
    lightTheme, 
    setLightTheme, 
    darkTheme, 
    setDarkTheme,
    setIsPremium 
  } = useTheme();
  
  const { isSubscribed, openCheckout } = useSubscription();
  
  // Update premium status when subscription status changes
  useEffect(() => {
    setIsPremium(isSubscribed);
  }, [isSubscribed, setIsPremium]);
  
  // Light theme options with premium indicator
  const lightThemeOptions = [
    { value: "lavender", name: "Lavender" },
    { value: "mint", name: "Mint" },
    { value: "peach", name: "Peach" },
    { value: "sky", name: "Sky" },
  ];
  
  // Premium light themes
  const premiumLightThemes = [
    { value: "pink", name: "Pink Dreams" },
    { value: "starry", name: "Starry Night" },
    { value: "sunset", name: "Sunset Glow" },
    { value: "rainbow", name: "Rainbow Vibes" },
  ];
  
  // Dark theme options
  const darkThemeOptions = [
    { value: "midnight", name: "Midnight" },
    { value: "forest", name: "Forest" },
    { value: "plum", name: "Plum" },
    { value: "ocean", name: "Ocean" },
  ];
  
  // Premium dark themes
  const premiumDarkThemes = [
    { value: "nebula", name: "Nebula" },
    { value: "aurora", name: "Aurora" },
    { value: "cosmic", name: "Cosmic" },
    { value: "void", name: "Void" },
  ];
  
  // Handle theme changes, check for premium access
  const handleThemeChange = (newTheme: string, isPremiumTheme: boolean, isDarkTheme = false) => {
    if (isPremiumTheme && !isSubscribed) {
      toast.error("Premium themes require a subscription", {
        action: {
          label: 'Upgrade',
          onClick: () => openCheckout()
        }
      });
      return;
    }
    
    if (isDarkTheme) {
      setDarkTheme(newTheme);
    } else {
      setLightTheme(newTheme);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Customize Your Journal</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Display Mode</CardTitle>
            <CardDescription>Choose how you want your journal to look</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <Toggle
                variant="outline"
                aria-label="Toggle light mode"
                className={`px-6 h-16 ${
                  theme === "light" ? "border-2 border-primary" : ""
                }`}
                pressed={theme === "light"}
                onPressedChange={() => setTheme("light")}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl">☀️</span>
                  <span className="mt-1">Light</span>
                </div>
              </Toggle>
              
              <Toggle
                variant="outline"
                aria-label="Toggle dark mode"
                className={`px-6 h-16 ${
                  theme === "dark" ? "border-2 border-primary" : ""
                }`}
                pressed={theme === "dark"}
                onPressedChange={() => setTheme("dark")}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl">🌙</span>
                  <span className="mt-1">Dark</span>
                </div>
              </Toggle>
              
              <Toggle
                variant="outline"
                aria-label="Toggle system theme"
                className={`px-6 h-16 ${
                  theme === "system" ? "border-2 border-primary" : ""
                }`}
                pressed={theme === "system"}
                onPressedChange={() => setTheme("system")}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl">⚙️</span>
                  <span className="mt-1">System</span>
                </div>
              </Toggle>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Light Themes</CardTitle>
            <CardDescription>Choose your preferred light theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {lightThemeOptions.map((option) => (
                <Toggle
                  key={option.value}
                  variant="outline"
                  aria-label={`Toggle ${option.name} theme`}
                  className={`w-24 h-16 relative ${
                    lightTheme === option.value ? "border-2 border-primary" : ""
                  }`}
                  pressed={lightTheme === option.value}
                  onPressedChange={() => handleThemeChange(option.value, false)}
                >
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 h-8 rounded-full mb-1"
                      style={{ 
                        background: option.value === "lavender" ? "#bc7bed" :
                                   option.value === "mint" ? "#92dbb7" :
                                   option.value === "peach" ? "#f5b086" : "#79d8e6"
                      }}
                    />
                    <span>{option.name}</span>
                  </div>
                </Toggle>
              ))}
              
              {/* Premium Light Themes */}
              {premiumLightThemes.map((option) => (
                <Toggle
                  key={option.value}
                  variant="outline"
                  aria-label={`Toggle ${option.name} theme`}
                  className={`w-24 h-16 relative ${
                    lightTheme === option.value ? "border-2 border-primary" : "opacity-80"
                  }`}
                  pressed={lightTheme === option.value}
                  onPressedChange={() => handleThemeChange(option.value, true)}
                >
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 h-8 rounded-full mb-1"
                      style={{ 
                        background: option.value === "pink" ? "#ee9ca7" :
                                   option.value === "starry" ? "#9eadf0" :
                                   option.value === "sunset" ? "#ff4e50" : "#6a82fb"
                      }}
                    />
                    <span>{option.name}</span>
                    {!isSubscribed && (
                      <Crown className="absolute top-1 right-1 h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </Toggle>
              ))}
            </div>
            
            {!isSubscribed && (
              <div className="mt-4 bg-muted/50 p-3 rounded-md flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Premium themes available</span>
                  <p className="text-muted-foreground text-xs">Upgrade to access exclusive themes</p>
                </div>
                <Button size="sm" onClick={openCheckout} className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Crown className="h-4 w-4 mr-1" /> Upgrade
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Dark Themes</CardTitle>
            <CardDescription>Choose your preferred dark theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {darkThemeOptions.map((option) => (
                <Toggle
                  key={option.value}
                  variant="outline"
                  aria-label={`Toggle ${option.name} theme`}
                  className={`w-24 h-16 ${
                    darkTheme === option.value ? "border-2 border-primary" : ""
                  }`}
                  pressed={darkTheme === option.value}
                  onPressedChange={() => handleThemeChange(option.value, false, true)}
                >
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 h-8 rounded-full mb-1"
                      style={{ 
                        background: option.value === "midnight" ? "#1e1b3c" :
                                   option.value === "forest" ? "#1a332a" :
                                   option.value === "plum" ? "#3d1a33" : "#0f2b3d"
                      }}
                    />
                    <span>{option.name}</span>
                  </div>
                </Toggle>
              ))}
              
              {/* Premium Dark Themes */}
              {premiumDarkThemes.map((option) => (
                <Toggle
                  key={option.value}
                  variant="outline"
                  aria-label={`Toggle ${option.name} theme`}
                  className={`w-24 h-16 relative ${
                    darkTheme === option.value ? "border-2 border-primary" : "opacity-80"
                  }`}
                  pressed={darkTheme === option.value}
                  onPressedChange={() => handleThemeChange(option.value, true, true)}
                >
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 h-8 rounded-full mb-1"
                      style={{ 
                        background: option.value === "nebula" ? "#2d1a40" :
                                   option.value === "aurora" ? "#122e20" :
                                   option.value === "cosmic" ? "#0d1b3a" : "#121212"
                      }}
                    />
                    <span>{option.name}</span>
                    {!isSubscribed && (
                      <Crown className="absolute top-1 right-1 h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </Toggle>
              ))}
            </div>
            
            {!isSubscribed && (
              <div className="mt-4 bg-muted/50 p-3 rounded-md flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Premium themes available</span>
                  <p className="text-muted-foreground text-xs">Upgrade to access exclusive themes</p>
                </div>
                <Button size="sm" onClick={openCheckout} className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Crown className="h-4 w-4 mr-1" /> Upgrade
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
