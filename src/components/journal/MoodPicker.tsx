
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const moodOptions = [
    { name: moodNames.dead, value: "dead", icon: Skull, color: "text-mood-dead" },
    { name: moodNames.sad, value: "sad", icon: FrownIcon, color: "text-mood-sad" },
    { name: moodNames.meh, value: "meh", icon: MehIcon, color: "text-mood-meh" },
    { name: moodNames.good, value: "good", icon: SmileIcon, color: "text-mood-good" },
    { name: moodNames.awesome, value: "awesome", icon: PartyPopper, color: "text-gold-dark" }
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
            {selectedMoodOption.value === "awesome" ? (
              <PartyPopper className="h-5 w-5 text-gold-dark" />
            ) : (
              <selectedMoodOption.icon 
                className={`h-5 w-5 ${selectedMoodOption.color}`} 
              />
            )}
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
                    {mood.value === "awesome" ? (
                      <PartyPopper className="h-7 w-7 text-gold-dark" />
                    ) : (
                      <mood.icon className={`h-7 w-7 ${mood.color}`} />
                    )}
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
