
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Define theme options
const lightThemes = [
  { id: "lavender", name: "Lavender", color: "#E6E6FA" },
  { id: "mint", name: "Mint", color: "#F5FFFA" },
  { id: "peach", name: "Peach", color: "#FFDAB9" },
  { id: "sky", name: "Sky Blue", color: "#E0F7FA" }
];

const darkThemes = [
  { id: "midnight", name: "Midnight", color: "#2c3e50" },
  { id: "forest", name: "Forest", color: "#2E4045" },
  { id: "plum", name: "Plum", color: "#4A3B4B" },
  { id: "ocean", name: "Ocean", color: "#1F3A5F" }
];

export default function CustomizePage() {
  const { lightTheme, setLightTheme, darkTheme, setDarkTheme } = useTheme();
  
  // Mood customization
  const [moodNames, setMoodNames] = useState<{[key: string]: string}>({
    dead: "Dead Inside",
    sad: "Shity",
    meh: "Meh",
    good: "Pretty Good",
    awesome: "Fucking AWESOME"
  });
  
  // Load stored mood names
  useEffect(() => {
    const storedMoodNames = localStorage.getItem("fakudid-mood-names");
    if (storedMoodNames) {
      setMoodNames(JSON.parse(storedMoodNames));
    }
  }, []);
  
  const saveMoodNames = () => {
    localStorage.setItem("fakudid-mood-names", JSON.stringify(moodNames));
    toast.success("Mood names saved successfully");
  };
  
  const handleMoodNameChange = (mood: string, name: string) => {
    setMoodNames(prev => ({
      ...prev,
      [mood]: name
    }));
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customize Themes</CardTitle>
            <CardDescription>Personalize the look and feel of your journal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Light Mode Themes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lightThemes.map(theme => (
                  <div 
                    key={theme.id}
                    className={`relative cursor-pointer rounded-lg p-2 transition-all ${
                      lightTheme === theme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setLightTheme(theme.id)}
                  >
                    <div 
                      className="h-24 rounded-md w-full mb-2" 
                      style={{ backgroundColor: theme.color }}
                    />
                    <div className="text-center font-medium">{theme.name}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Dark Mode Themes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {darkThemes.map(theme => (
                  <div 
                    key={theme.id}
                    className={`relative cursor-pointer rounded-lg p-2 transition-all ${
                      darkTheme === theme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setDarkTheme(theme.id)}
                  >
                    <div 
                      className="h-24 rounded-md w-full mb-2" 
                      style={{ backgroundColor: theme.color }}
                    />
                    <div className="text-center font-medium">{theme.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customize Moods</CardTitle>
            <CardDescription>Personalize how you express your feelings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Skull className="h-8 w-8 text-mood-dead" />
                  <Input 
                    value={moodNames.dead}
                    onChange={(e) => handleMoodNameChange('dead', e.target.value)}
                    maxLength={20}
                    placeholder="Dead Inside"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <FrownIcon className="h-8 w-8 text-mood-sad" />
                  <Input 
                    value={moodNames.sad}
                    onChange={(e) => handleMoodNameChange('sad', e.target.value)}
                    maxLength={20}
                    placeholder="Shity"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <MehIcon className="h-8 w-8 text-mood-meh" />
                  <Input 
                    value={moodNames.meh}
                    onChange={(e) => handleMoodNameChange('meh', e.target.value)}
                    maxLength={20}
                    placeholder="Meh"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <SmileIcon className="h-8 w-8 text-mood-good" />
                  <Input 
                    value={moodNames.good}
                    onChange={(e) => handleMoodNameChange('good', e.target.value)}
                    maxLength={20}
                    placeholder="Pretty Good"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <PartyPopper className="h-8 w-8 text-mood-awesome" />
                  <Input 
                    value={moodNames.awesome}
                    onChange={(e) => handleMoodNameChange('awesome', e.target.value)}
                    maxLength={20}
                    placeholder="Fucking AWESOME"
                  />
                </div>
              </div>
              
              <Button 
                className="mt-4 w-full md:w-auto bg-fakudid-purple hover:bg-fakudid-darkPurple"
                onClick={saveMoodNames}
              >
                Save Mood Names
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
