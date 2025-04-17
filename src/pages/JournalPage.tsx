
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper, ImageIcon, Music, SendHorizontal, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  getTodayEntry, 
  autosaveEntry, 
  addAttachment 
} from "@/services/journalService";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [isEditing, setIsEditing] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // Custom mood names
  const [moodNames, setMoodNames] = useState<{[key: string]: string}>({
    dead: "Dead Inside",
    sad: "Shity",
    meh: "Meh",
    good: "Pretty Good",
    awesome: "Fucking AWESOME"
  });
  
  // Load custom mood names
  useEffect(() => {
    const storedMoodNames = localStorage.getItem("fakudid-mood-names");
    if (storedMoodNames) {
      setMoodNames(JSON.parse(storedMoodNames));
    }
  }, []);

  // Load today's entry, if it exists
  useEffect(() => {
    const todayEntry = getTodayEntry();
    if (todayEntry) {
      setJournalEntry(todayEntry.content);
      setSelectedMood(todayEntry.mood);
      setEntryId(todayEntry.id);
      setIsEditing(true);
    }
  }, []);

  // Autosave functionality
  useEffect(() => {
    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set a new timer to autosave after 3 seconds of inactivity
    if (journalEntry.trim() || selectedMood) {
      autoSaveTimerRef.current = setTimeout(() => {
        autosaveEntry(journalEntry, selectedMood as any);
      }, 3000);
    }

    // Cleanup function
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [journalEntry, selectedMood]);

  const generatePrompt = () => {
    const randomIndex = Math.floor(Math.random() * PROMPTS.length);
    const randomPrompt = PROMPTS[randomIndex];
    
    // Add a newline and AI star icon before the prompt if there's existing text
    if (journalEntry.trim()) {
      setJournalEntry(journalEntry.trim() + '\n\n✨ ' + randomPrompt);
    } else {
      setJournalEntry('✨ ' + randomPrompt);
    }
  };

  const handleSave = () => {
    if (!journalEntry.trim()) {
      toast.error("Please write something in your journal");
      return;
    }
    
    if (!selectedMood) {
      toast.error("Please select a mood for your entry");
      return;
    }
    
    const saved = autosaveEntry(journalEntry.trim(), selectedMood as any);
    
    if (saved) {
      // Retrieve the entry ID if it's a new entry
      if (!isEditing) {
        const todayEntry = getTodayEntry();
        if (todayEntry) {
          setEntryId(todayEntry.id);
          setIsEditing(true);
        }
      }
      
      toast.success(isEditing ? "Journal entry updated" : "Journal entry saved");
    }
  };

  const handleImageAttachment = () => {
    // First check if we have an entry ID
    if (!entryId) {
      // Save the entry first
      if (!journalEntry.trim()) {
        toast.error("Please write something in your journal before adding attachments");
        return;
      }
      
      if (!selectedMood) {
        toast.error("Please select a mood for your entry before adding attachments");
        return;
      }
      
      const saved = autosaveEntry(journalEntry.trim(), selectedMood as any);
      if (!saved) {
        toast.error("Failed to save journal entry. Please try again.");
        return;
      }
      
      const todayEntry = getTodayEntry();
      if (todayEntry) {
        setEntryId(todayEntry.id);
        setIsEditing(true);
        // Now that the entry is saved, open the file input
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }
    } else {
      // We already have an entry ID, so just open the file input
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handleMusicAttachment = () => {
    // First check if we have an entry ID
    if (!entryId) {
      // Save the entry first
      if (!journalEntry.trim()) {
        toast.error("Please write something in your journal before adding attachments");
        return;
      }
      
      if (!selectedMood) {
        toast.error("Please select a mood for your entry before adding attachments");
        return;
      }
      
      const saved = autosaveEntry(journalEntry.trim(), selectedMood as any);
      if (!saved) {
        toast.error("Failed to save journal entry. Please try again.");
        return;
      }
      
      const todayEntry = getTodayEntry();
      if (todayEntry) {
        setEntryId(todayEntry.id);
        setIsEditing(true);
        // Now that the entry is saved, open the file input
        if (audioInputRef.current) {
          audioInputRef.current.click();
        }
      }
    } else {
      // We already have an entry ID, so just open the file input
      if (audioInputRef.current) {
        audioInputRef.current.click();
      }
    }
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "music") => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Now add the attachment
    if (entryId) {
      await addAttachment(entryId, type, files[0]);
      toast.success(`${type === "image" ? "Image" : "Audio"} attached successfully`);
    } else {
      toast.error("Something went wrong. Please try saving your entry first.");
    }
    
    // Reset the input
    event.target.value = '';
  };

  const moodOptions = [
    { name: moodNames.dead, value: "dead", icon: Skull, color: "text-mood-dead" },
    { name: moodNames.sad, value: "sad", icon: FrownIcon, color: "text-mood-sad" },
    { name: moodNames.meh, value: "meh", icon: MehIcon, color: "text-mood-meh" },
    { name: moodNames.good, value: "good", icon: SmileIcon, color: "text-mood-good" },
    { name: moodNames.awesome, value: "awesome", icon: PartyPopper, color: "text-mood-awesome" }
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
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
      <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
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
      
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between'} items-center`}>
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFileSelected(e, "image")} 
            accept="image/*" 
            className="hidden" 
          />
          <input 
            type="file" 
            ref={audioInputRef} 
            onChange={(e) => handleFileSelected(e, "music")} 
            accept="audio/*" 
            className="hidden" 
          />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleImageAttachment}>
                  <ImageIcon className="h-5 w-5" />
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
                <Button variant="outline" size="icon" onClick={handleMusicAttachment}>
                  <Music className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Music</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" className="gap-2" onClick={generatePrompt}>
            <Sparkles className="h-4 w-4" />
            {isMobile ? "" : "Generate Prompt"}
          </Button>
          <Button className="bg-fakudid-purple hover:bg-fakudid-darkPurple" onClick={handleSave}>
            {isEditing ? "Update" : "Save"} <SendHorizontal className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
