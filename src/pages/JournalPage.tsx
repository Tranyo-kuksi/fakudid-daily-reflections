import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getRandomPrewrittenPrompt } from "@/constants/prewrittenPrompts";

export default function JournalPage() {
  const [journalEntry, setJournalEntry] = useState("");
  const [currentMood, setCurrentMood] = useState("Neutral");
  const [prompt, setPrompt] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { isSubscribed } = useSubscription();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchLatestEntry();
    }
  }, [user]);

  const fetchLatestEntry = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('journal_entries')
        .select('entry, mood')
        .eq('user_id', user!.id)
        .eq('date', today)
        .single();

      if (error) {
        console.error("Error fetching entry:", error);
        return;
      }

      if (data) {
        setJournalEntry(data.entry);
        setCurrentMood(data.mood);
      } else {
        setJournalEntry("");
        setCurrentMood("Neutral");
      }
    } catch (error) {
      console.error("Error fetching entry:", error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save your entry.");
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('journal_entries')
        .upsert({
          user_id: user.id,
          date: today,
          entry: journalEntry,
          mood: currentMood,
        }, { onConflict: ['user_id', 'date'] });

      if (error) {
        throw error;
      }

      toast.success("Journal entry saved!");
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Failed to save journal entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const generatePrompt = async () => {
    try {
      setPromptLoading(true);
      
      if (isSubscribed) {
        // For premium users - use AI generated prompts
        const { data, error } = await supabase.functions.invoke('generate-prompt', {
          body: { mood: currentMood }
        });
        
        if (error) throw error;
        if (!data || !data.prompt) throw new Error('Invalid response from prompt generator');
        
        setPrompt(data.prompt);
        toast.success('Prompt generated successfully!');
      } else {
        // For free users - use prewritten prompts
        const newPrompt = getRandomPrewrittenPrompt();
        setPrompt(newPrompt);
        toast.success('Prompt generated successfully!');
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error('Failed to generate prompt. Please try again.');
    } finally {
      setPromptLoading(false);
    }
  };
  
  const moodOptions = [
    "Happy", "Excited", "Content", "Grateful",
    "Calm", "Peaceful", "Relaxed", "Reflective",
    "Neutral",
    "Anxious", "Stressed", "Overwhelmed", "Sad",
    "Lonely", "Frustrated", "Tired", "Unmotivated"
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-center">Daily Journal</h1>
        <p className="text-muted-foreground text-center">Reflect on your day.</p>
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-col space-y-4">
          <Select value={currentMood} onValueChange={setCurrentMood}>
            <SelectTrigger>
              <SelectValue placeholder="Select mood" />
            </SelectTrigger>
            <SelectContent>
              {moodOptions.map(mood => (
                <SelectItem key={mood} value={mood}>{mood}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={generatePrompt}
            disabled={promptLoading}
            className={isSubscribed ? 
              "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-900" : 
              ""
            }
          >
            {promptLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {isSubscribed ? "Generate AI Prompt" : "Generate Prompt"}
              </>
            )}
          </Button>

          {prompt && (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              {prompt}
            </div>
          )}

          <Textarea
            placeholder="Write about your day..."
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            className="resize-none"
          />

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Entry"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
