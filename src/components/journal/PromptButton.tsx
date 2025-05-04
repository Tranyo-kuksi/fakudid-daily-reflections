
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, Sparkles } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useJournalPrompts } from "@/hooks/use-journal-prompts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { getAllEntries } from "@/services/journalService";
import { useAuth } from "@/contexts/AuthContext";

interface PromptButtonProps {
  journalEntry: string;
  onPromptGenerated: (prompt: string) => void;
  readOnly?: boolean;
}

// Array of emojis to use for free prompts
const FREE_PROMPT_EMOJIS = ["⭐", "🌟", "💫", "✨", "🔆", "🌠"];

// Array of emojis to use for premium AI prompts
const PREMIUM_PROMPT_EMOJIS = ["🚀", "❤️", "🎉", "🤔", "😅", "✨", "💡", "🌈"];

export const PromptButton: React.FC<PromptButtonProps> = ({
  journalEntry,
  onPromptGenerated,
  readOnly = false
}) => {
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const { isSubscribed, openCheckout } = useSubscription();
  const { getRandomPrompt } = useJournalPrompts();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<{username?: string, mature_content?: boolean}>({});

  // Fetch user profile to get username and mature content preference
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, mature_content')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
          
        if (data) {
          setUserProfile({
            username: data.username || undefined,
            mature_content: !!data.mature_content
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Get a random emoji from the appropriate array
  const getRandomEmoji = (isPremium: boolean) => {
    const emojiArray = isPremium ? PREMIUM_PROMPT_EMOJIS : FREE_PROMPT_EMOJIS;
    return emojiArray[Math.floor(Math.random() * emojiArray.length)];
  };

  // Premium gradient for subscribers
  const subscriberButtonClass = "h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 hover:from-amber-400 hover:to-yellow-500 border border-amber-500/50";
  
  // Regular button for non-subscribers
  const regularButtonClass = "h-12 w-12 rounded-full shadow-lg bg-fakudid-purple hover:bg-fakudid-darkPurple";

  const handleGeneratePrompt = async () => {
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to generate prompts");
      return;
    }

    try {
      if (isSubscribed) {
        setIsGeneratingPrompt(true);
        toast.loading('Generating AI prompt...', { id: 'generate-prompt' });
        
        const allEntries = await getAllEntries();
        const recentEntries = allEntries
          .slice(0, 5)
          .filter(entry => entry.content !== journalEntry);

        // Get fresh session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          toast.dismiss('generate-prompt');
          setIsGeneratingPrompt(false);
          toast.error('Session expired. Please sign in again.');
          return;
        }

        const { data, error } = await supabase.functions.invoke('generate-prompt', {
          body: { 
            currentEntry: journalEntry,
            recentEntries: recentEntries,
            username: userProfile.username || null,
            mature_content: userProfile.mature_content || false
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        
        toast.dismiss('generate-prompt');
        setIsGeneratingPrompt(false);
        
        if (error) {
          console.error('Error generating prompt:', error);
          
          // Check for subscription required error
          if (data?.subscription_required) {
            toast.error('Premium subscription required for AI prompts', {
              action: {
                label: 'Upgrade',
                onClick: () => openCheckout()
              }
            });
            return;
          }
          
          toast.error('Failed to generate prompt: ' + (error.message || 'Unknown error'));
          return;
        }
        
        if (!data || !data.prompt) {
          console.error('Invalid response format:', data);
          toast.error('Failed to generate prompt: Invalid response from the API');
          return;
        }
        
        // Add the AI-generated prompt to the journal with a random emoji
        const randomEmoji = getRandomEmoji(true);
        if (journalEntry.trim()) {
          onPromptGenerated(journalEntry.trim() + '\n\n' + randomEmoji + ' ' + data.prompt);
        } else {
          onPromptGenerated(randomEmoji + ' ' + data.prompt);
        }
        
        toast.success('AI prompt added!');
      } else {
        // For free users, get a random pre-written prompt
        const randomPrompt = getRandomPrompt();
        const randomEmoji = getRandomEmoji(false);
        
        // Add the pre-written prompt to the journal
        if (journalEntry.trim()) {
          onPromptGenerated(journalEntry.trim() + '\n\n' + randomEmoji + ' ' + randomPrompt);
        } else {
          onPromptGenerated(randomEmoji + ' ' + randomPrompt);
        }
        
        toast.success('New prompt added!');
      }
    } catch (error) {
      console.error('Error with prompt:', error);
      toast.error('Failed to generate prompt: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsGeneratingPrompt(false);
      toast.dismiss('generate-prompt');
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="default"
            size="icon"
            className={isSubscribed ? subscriberButtonClass : regularButtonClass}
            onClick={handleGeneratePrompt}
            disabled={isGeneratingPrompt}
          >
            {isSubscribed ? (
              <Sparkles className="h-5 w-5 text-amber-900" />
            ) : (
              <Star className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {isSubscribed ? "Generate AI Prompt" : "Get Writing Prompt"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
