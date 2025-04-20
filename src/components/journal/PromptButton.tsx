
import React from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, Sparkles } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useJournalPrompts } from "@/hooks/use-journal-prompts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { getAllEntries } from "@/services/journalService";

interface PromptButtonProps {
  journalEntry: string;
  onPromptGenerated: (prompt: string) => void;
  readOnly?: boolean;
}

export const PromptButton: React.FC<PromptButtonProps> = ({
  journalEntry,
  onPromptGenerated,
  readOnly = false
}) => {
  const [isGeneratingPrompt, setIsGeneratingPrompt] = React.useState(false);
  const { isSubscribed, openCheckout } = useSubscription();
  const { getRandomPrompt } = useJournalPrompts();

  // Premium gradient for subscribers
  const subscriberButtonClass = "h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 hover:from-amber-400 hover:to-yellow-500 border border-amber-500/50";
  
  // Regular button for non-subscribers
  const regularButtonClass = "h-12 w-12 rounded-full shadow-lg bg-fakudid-purple hover:bg-fakudid-darkPurple";

  const handleGeneratePrompt = async () => {
    if (readOnly) {
      toast.error("Cannot modify past entries");
      return;
    }

    try {
      if (isSubscribed) {
        // Show loading state for AI prompt
        setIsGeneratingPrompt(true);
        toast.loading('Generating prompt...', { id: 'generate-prompt' });
        
        // Get recent entries for context
        const allEntries = await getAllEntries();
        const recentEntries = allEntries
          .slice(0, 5)
          .filter(entry => entry.content !== journalEntry);

        // Make sure we have the latest auth token
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.dismiss('generate-prompt');
          setIsGeneratingPrompt(false);
          toast.error('You must be logged in to generate AI prompts');
          return;
        }

        const { data, error } = await supabase.functions.invoke('generate-prompt', {
          body: { 
            currentEntry: journalEntry,
            recentEntries: recentEntries
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
        
        // Add the AI-generated prompt to the journal
        if (journalEntry.trim()) {
          onPromptGenerated(journalEntry.trim() + '\n\n✨ ' + data.prompt);
        } else {
          onPromptGenerated('✨ ' + data.prompt);
        }
        
        toast.success('AI prompt generated!');
      } else {
        // For free users, get a random pre-written prompt
        const randomPrompt = getRandomPrompt();
        
        // Add the pre-written prompt to the journal
        if (journalEntry.trim()) {
          onPromptGenerated(journalEntry.trim() + '\n\n⭐ ' + randomPrompt);
        } else {
          onPromptGenerated('⭐ ' + randomPrompt);
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
