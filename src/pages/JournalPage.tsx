
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper, Image, Music, SendHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Sample prompts
const PROMPTS = [
  "What's one thing you're proud of today?",
  "Describe a moment that made you laugh.",
  "What's something you're looking forward to?",
  "What's one thing you'd like to improve about yourself?",
  "Write about a time you felt truly proud of yourself.",
  "What's a challenge you're currently facing?",
  "What made you smile today?",
  "If you could change one thing about today, what would it be?",
  "What's something new you learned recently?",
  "Who made a positive impact on your day and why?"
];

export default function JournalPage() {
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const generatePrompt = () => {
    const randomIndex = Math.floor(Math.random() * PROMPTS.length);
    setJournalEntry(PROMPTS[randomIndex]);
  };

  const handleSave = () => {
    if (!journalEntry.trim()) {
      alert("Please write something in your journal");
      return;
    }
    
    if (!selectedMood) {
      alert("Please select a mood for your entry");
      return;
    }
    
    // In a real app, this would save to a database
    console.log("Saving entry:", { journalEntry, mood: selectedMood, date: new Date() });
    
    // Reset form
    setJournalEntry("");
    setSelectedMood(null);
    alert("Journal entry saved successfully!");
  };

  const moodOptions = [
    { name: "Dead Inside", value: "dead", icon: Skull, color: "text-mood-dead" },
    { name: "Shity", value: "sad", icon: FrownIcon, color: "text-mood-sad" },
    { name: "Meh", value: "meh", icon: MehIcon, color: "text-mood-meh" },
    { name: "Pretty Good", value: "good", icon: SmileIcon, color: "text-mood-good" },
    { name: "Fucking AWESOME", value: "awesome", icon: PartyPopper, color: "text-mood-awesome" }
  ];

  const MoodPickerButton = () => {
    const selectedMoodOption = selectedMood 
      ? moodOptions.find(m => m.value === selectedMood) 
      : null;
    
    return (
      <div className="relative">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => setShowMoodPicker(!showMoodPicker)}
        >
          {selectedMoodOption ? (
            <>
              <selectedMoodOption.icon className={`h-5 w-5 ${selectedMoodOption.color}`} />
              <span>{selectedMoodOption.name}</span>
            </>
          ) : (
            <>
              <SmileIcon className="h-5 w-5" />
              <span>How are you feeling?</span>
            </>
          )}
        </Button>
        
        {showMoodPicker && (
          <Card className="absolute top-12 z-10 p-2 w-full flex justify-between gap-2 animate-fade-in">
            {moodOptions.map((mood) => (
              <TooltipProvider key={mood.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={`p-2 ${selectedMood === mood.value ? 'bg-muted' : ''}`}
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

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">My Journal</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <MoodPickerButton />
      </div>
      
      <div className="mb-6">
        <Textarea 
          placeholder="Write about your day..."
          className="min-h-[300px] text-lg p-4 focus:border-fakudid-purple"
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Image className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Image</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Music className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Music</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePrompt}>
            Generate Prompt
          </Button>
          <Button className="bg-fakudid-purple hover:bg-fakudid-darkPurple" onClick={handleSave}>
            Save <SendHorizontal className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
