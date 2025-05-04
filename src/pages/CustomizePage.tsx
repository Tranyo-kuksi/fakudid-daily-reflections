
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { useState } from "react";

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
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  // Update premium status when subscription status changes
  useEffect(() => {
    setIsPremium(isSubscribed);
  }, [isSubscribed, setIsPremium]);
  
  // Light theme options
  const lightThemeOptions = [
    { value: "lavender", name: "Lavender", color: "#bc7bed" },
    { value: "mint", name: "Mint", color: "#92dbb7" },
    { value: "peach", name: "Peach", color: "#f5b086" },
    { value: "sky", name: "Sky", color: "#79d8e6" }
  ];
  
  // Premium light themes
  const premiumLightThemes = [
    { value: "cosmos-light", name: "Cosmos", color: "#d0c1e7" },
    { value: "zen-garden", name: "Zen Garden", color: "#cfdfc2" },
    { value: "retro-pop", name: "Retro Pop", color: "#ffeffa" },
    { value: "city-lights", name: "City Lights", color: "#d9e1f2" },
    { value: "golden-hour", name: "Golden Hour", color: "#fcd34d" },
    { value: "mindspace", name: "Mindspace", color: "#e0e7ff" },
    { value: "forest-retreat", name: "Forest Retreat", color: "#d9f99d" }
  ];
  
  // Dark theme options
  const darkThemeOptions = [
    { value: "midnight", name: "Midnight", color: "#1e1b3c" },
    { value: "forest", name: "Forest", color: "#1a332a" },
    { value: "plum", name: "Plum", color: "#3d1a33" },
    { value: "ocean", name: "Ocean", color: "#0f2b3d" }
  ];
  
  // Premium dark themes
  const premiumDarkThemes = [
    { value: "cosmos", name: "Cosmos", color: "#1f1135" },
    { value: "zen-garden", name: "Zen Garden", color: "#1c2910" },
    { value: "retro-pop", name: "Retro Pop", color: "#170c1a" },
    { value: "city-lights", name: "City Lights", color: "#0f172a" },
    { value: "golden-hour", name: "Golden Hour", color: "#422006" },
    { value: "mindspace", name: "Mindspace", color: "#1e1b4b" },
    { value: "forest-retreat", name: "Forest Retreat", color: "#1a2e05" }
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

  // Handle opening the templates dialog
  const handleOpenTemplateDialog = () => {
    if (isSubscribed) {
      setTemplateDialogOpen(true);
    } else {
      toast.error("Templates require a premium subscription", {
        action: {
          label: 'Upgrade',
          onClick: () => openCheckout()
        }
      });
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
                      style={{ background: option.color }}
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
                      style={{ background: option.color }}
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
                      style={{ background: option.color }}
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
                      style={{ background: option.color }}
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
        
        {/* Templates Section */}
        <Card>
          <CardHeader>
            <CardTitle>Journal Templates</CardTitle>
            <CardDescription>Customize how you structure your journal entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button 
                onClick={handleOpenTemplateDialog}
                className="w-full md:w-auto"
                variant={isSubscribed ? "default" : "outline"}
              >
                {isSubscribed ? (
                  "Manage Journal Templates"
                ) : (
                  <span className="flex items-center">
                    <Crown className="h-4 w-4 mr-2 text-amber-500" /> 
                    Premium Feature
                  </span>
                )}
              </Button>
            </div>
            
            {!isSubscribed && (
              <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm text-center">
                <p className="mb-2">
                  Templates let you create structured journal entries with custom sections
                </p>
                <Button 
                  size="sm" 
                  onClick={openCheckout} 
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Crown className="h-4 w-4 mr-1" /> Upgrade to Premium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Mood Labels Section */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Labels</CardTitle>
            <CardDescription>Customize your mood tracking options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 bg-mood-dead rounded-full mb-1"></div>
                <span className="text-sm">Dead</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 bg-mood-sad rounded-full mb-1"></div>
                <span className="text-sm">Sad</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 bg-mood-meh rounded-full mb-1"></div>
                <span className="text-sm">Meh</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 bg-mood-good rounded-full mb-1"></div>
                <span className="text-sm">Good</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 bg-gold-gradient rounded-full mb-1"></div>
                <span className="text-sm">Awesome</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Mood tracking helps you identify patterns in your emotional wellbeing over time
            </p>
          </CardContent>
        </Card>
      </div>
      
      <TemplateDialog 
        isOpen={templateDialogOpen} 
        onClose={() => setTemplateDialogOpen(false)}
      />
    </div>
  );
}
