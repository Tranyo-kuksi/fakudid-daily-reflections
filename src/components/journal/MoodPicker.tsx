
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper, Poop, Angry, HeartCrack, Heart, Star, CircleX } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Define default icons and their custom alternatives
const moodIcons = {
  dead: {
    default: Skull,
    alternatives: [CircleX, HeartCrack]
  },
  sad: {
    default: FrownIcon,
    alternatives: [Angry, Poop]
  },
  meh: {
    default: MehIcon,
    alternatives: [MehIcon]
  },
  good: {
    default: SmileIcon,
    alternatives: [Heart]
  },
  awesome: {
    default: PartyPopper,
    alternatives: [Star]
  }
};

interface MoodPickerProps {
  selectedMood: string | null;
  setSelectedMood: (mood: string) => void;
  moodNames: { [key: string]: string };
  readOnly?: boolean;
}

export const MoodPicker: React.FC<MoodPickerProps> = ({ 
  selectedMood, 
  setSelectedMood, 
  moodNames,
  readOnly = false 
}) => {
  const [showMoodPicker, setShowMoodPicker] = React.useState(false);
  const isMobile = useIsMobile();
  const [customIcons, setCustomIcons] = useLocalStorage<{[key: string]: string}>("fakudid-custom-icons", {});

  const getMoodIcon = (mood: string) => {
    if (!mood) return null;
    
    const customIconName = customIcons[mood];
    if (customIconName) {
      // Find the custom icon in alternatives
      for (const alt of moodIcons[mood].alternatives) {
        if (alt.displayName === customIconName) {
          return alt;
        }
      }
    }
    
    // Return default icon if no custom icon is set
    return moodIcons[mood].default;
  };

  const moodOptions = [
    { name: moodNames.dead, value: "dead", icon: getMoodIcon("dead"), color: "text-mood-dead" },
    { name: moodNames.sad, value: "sad", icon: getMoodIcon("sad"), color: "text-mood-sad" },
    { name: moodNames.meh, value: "meh", icon: getMoodIcon("meh"), color: "text-mood-meh" },
    { name: moodNames.good, value: "good", icon: getMoodIcon("good"), color: "text-mood-good" },
    { name: moodNames.awesome, value: "awesome", icon: getMoodIcon("awesome"), color: "text-gold-dark" }
  ];

  const selectedMoodOption = selectedMood 
    ? moodOptions.find(m => m.value === selectedMood) 
    : null;

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className="gap-2"
        onClick={() => setShowMoodPicker(!showMoodPicker)}
        disabled={readOnly}
      >
        {selectedMoodOption ? (
          <>
            <selectedMoodOption.icon 
              className={`h-5 w-5 ${selectedMoodOption.color}`} 
            />
            <span>{selectedMoodOption.name}</span>
          </>
        ) : (
          <>
            <SmileIcon className="h-5 w-5" />
            <span>{isMobile ? "Mood" : "How are you feeling?"}</span>
          </>
        )}
      </Button>
      
      {showMoodPicker && (
        <Card className="absolute top-12 right-0 z-10 p-2 w-60 flex justify-between gap-2 animate-fade-in">
          {moodOptions.map((mood) => (
            <TooltipProvider key={mood.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`p-2 flex items-center justify-center ${selectedMood === mood.value ? 'bg-muted' : ''}`}
                    onClick={() => {
                      setSelectedMood(mood.value);
                      setShowMoodPicker(false);
                    }}
                  >
                    <mood.icon className={`h-7 w-7 ${mood.color}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{mood.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </Card>
      )}
    </div>
  );
};
