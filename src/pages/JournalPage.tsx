
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skull, FrownIcon, MehIcon, SmileIcon, PartyPopper, ImageIcon, Music, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useParams, useLocation } from "react-router-dom";
import { 
  getTodayEntry, 
  autosaveEntry, 
  addAttachment,
  deleteAttachment,
  getAllEntries,
  getEntryById
} from "@/services/journalService";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { AttachmentViewer } from "@/components/attachments/AttachmentViewer";

export default function JournalPage() {
  const [journalTitle, setJournalTitle] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const params = useParams();
  const location = useLocation();
  
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

  // Load entry based on URL parameters
  useEffect(() => {
    const loadEntry = () => {
      // If we have an ID in the URL, load that specific entry
      if (params.id) {
        const specificEntry = getEntryById(params.id);
        if (specificEntry) {
          setJournalTitle(specificEntry.title || "");
          setJournalEntry(specificEntry.content);
          setSelectedMood(specificEntry.mood);
          setEntryId(specificEntry.id);
          setIsEditing(true);
          
          // If it's not today's entry, make it read-only
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const entryDate = new Date(specificEntry.date);
          entryDate.setHours(0, 0, 0, 0);
          
          if (entryDate.getTime() !== today.getTime()) {
            setReadOnly(true);
          } else {
            setReadOnly(false);
          }
          
          return;
        }
      }

      // If no ID in URL or ID not found, load today's entry
      const todayEntry = getTodayEntry();
      if (todayEntry) {
        setJournalTitle(todayEntry.title || "");
        setJournalEntry(todayEntry.content);
        setSelectedMood(todayEntry.mood);
        setEntryId(todayEntry.id);
        setIsEditing(true);
        setReadOnly(false);
      } else {
        // Reset the form for a new entry
        setJournalTitle("");
        setJournalEntry("");
        setSelectedMood(null);
        setEntryId(null);
        setIsEditing(false);
        setReadOnly(false);
      }
    };

    loadEntry();
  }, [params.id, location.pathname]);

  // Update autosave effect with shorter delay (500ms instead of 3000ms)
  useEffect(() => {
    if (readOnly) return; // Don't autosave if in read-only mode
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (journalTitle.trim() || journalEntry.trim() || selectedMood) {
      autoSaveTimerRef.current = setTimeout(() => {
        autosaveEntry(journalTitle, journalEntry, selectedMood as any);
      }, 500); // Changed from 3000ms to 500ms
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [journalTitle, journalEntry, selectedMood, readOnly]);

  const generatePrompt = async () => {
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }
    
    try {
      // Show loading state
      setIsGeneratingPrompt(true);
      toast.loading('Generating prompt...', { id: 'generate-prompt' });
      
      // Get recent entries (last 5 entries, excluding the current one)
      const recentEntries = getAllEntries()
        .slice(0, 5)
        .filter(entry => entry.content !== journalEntry);

      const { data, error } = await supabase.functions.invoke('generate-prompt', {
        body: { 
          currentEntry: journalEntry,
          recentEntries: recentEntries
        }
      });
      
      // Dismiss loading toast
      toast.dismiss('generate-prompt');
      setIsGeneratingPrompt(false);
      
      if (error) {
        console.error('Error generating prompt:', error);
        toast.error('Failed to generate prompt: ' + error.message);
        return;
      }
      
      if (!data || !data.prompt) {
        console.error('Invalid response format:', data);
        if (data && data.error) {
          toast.error(`Failed to generate prompt: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
        } else {
          toast.error('Failed to generate prompt: Invalid response from the API');
        }
        return;
      }
      
      // Add a newline and AI star icon before the prompt if there's existing text
      if (journalEntry.trim()) {
        setJournalEntry(journalEntry.trim() + '\n\n✨ ' + data.prompt);
      } else {
        setJournalEntry('✨ ' + data.prompt);
      }
      
      toast.success(`Prompt generated!`);
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error('Failed to generate prompt: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsGeneratingPrompt(false);
      toast.dismiss('generate-prompt');
    }
  };

  const handleSave = () => {
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }
    
    if (!journalEntry.trim()) {
      toast.error("Please write something in your journal");
      return;
    }
    
    if (!selectedMood) {
      toast.error("Please select a mood for your entry");
      return;
    }
    
    const saved = autosaveEntry(journalTitle, journalEntry.trim(), selectedMood as any);
    
    if (saved) {
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
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }
    
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
      
      const saved = autosaveEntry(journalTitle, journalEntry.trim(), selectedMood as any);
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
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }
    
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
      
      const saved = autosaveEntry(journalTitle, journalEntry.trim(), selectedMood as any);
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
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }
    
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

  const handleDeleteAttachment = (attachmentIndex: number) => {
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }
    
    if (entryId) {
      const updatedEntry = deleteAttachment(entryId, attachmentIndex);
      if (updatedEntry) {
        // Force a re-render to show the updated attachments
        setEntryId(updatedEntry.id);
      }
    }
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
          disabled={readOnly}
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

  // Get the entry for displaying attachments
  const currentEntry = entryId ? getEntryById(entryId) : null;

  return (
    <div className="w-full h-full relative">
      {readOnly && (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 mb-4 rounded-md">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium text-center">
            This is a past entry. You are viewing it in read-only mode.
          </p>
        </div>
      )}
      
      {/* Controls section */}
      <div className="mb-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="Title your day..."
              className="text-lg"
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              readOnly={readOnly}
            />
          </div>
          
          <div className="flex items-center gap-4">
            {/* Attachment buttons */}
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
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleImageAttachment}
                      disabled={readOnly}
                    >
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
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleMusicAttachment}
                      disabled={readOnly}
                    >
                      <Music className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Music</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <MoodPickerButton />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <Textarea 
        placeholder="Write about your day..."
        className="min-h-[calc(100vh-300px)] w-full resize-none text-lg p-4 focus:border-fakudid-purple border-none"
        value={journalEntry}
        onChange={(e) => setJournalEntry(e.target.value)}
        readOnly={readOnly}
      />

      {/* Fixed attachments viewer if there are any */}
      {currentEntry?.attachments && currentEntry.attachments.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4">
          <div className="container max-w-3xl mx-auto">
            <h3 className="text-sm font-medium mb-2">Attachments</h3>
            <AttachmentViewer 
              attachments={currentEntry.attachments} 
              size="medium"
              onDelete={readOnly ? undefined : handleDeleteAttachment}
            />
          </div>
        </div>
      )}

      {/* Floating prompt generator button - only show for non-readonly entries */}
      {!readOnly && (
        <div className="fixed bottom-24 right-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default"
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg bg-fakudid-purple hover:bg-fakudid-darkPurple"
                  onClick={generatePrompt}
                  disabled={isGeneratingPrompt}
                >
                  <Sparkles className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Generate Prompt</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
