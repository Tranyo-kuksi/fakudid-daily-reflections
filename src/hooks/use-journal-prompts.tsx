
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Clean prompts (no swearing)
const CLEAN_JOURNAL_PROMPTS = [
  "What's on your mind today?",
  "Something changed today - what was it?",
  "What's troubling you right now?",
  "That feeling you can't shake - what's it about?",
  "Three words to describe today. Why those?",
  "What's one positive moment from today?",
  "Something you need to express?",
  "Fill in: Today made me feel ___ because ___",
  "How are you doing? What do you need right now?",
  "What's keeping you up at night lately?",
  "Someone on your mind? Why them?",
  "What are your plans for tomorrow?",
  "What is your intuition telling you?",
  "What was the best part of today?",
  "Something you're not saying out loud - what is it?",
  "What's been frustrating you?",
  "Where is your stress coming from?",
  "One thing you'd change about today? Why?",
  "What are you proud of yourself for today?",
  "What's one small thing you're grateful for?"
];

// Mature prompts (with swearing/edgy content)
const MATURE_JOURNAL_PROMPTS = [
  "What's messing with your head today?",
  "Something changed today - was it damn good or bad?",
  "What's really pissing you off right now?",
  "That feeling you can't shake - what the hell is it about?",
  "Three words to describe today. Why those damn words?",
  "What's one fucking awesome moment from today?",
  "Something you need to get off your chest?",
  "Real talk: Today made me feel ___ because ___",
  "How are you actually doing? No bullshit.",
  "What's keeping you up at night? Spill it.",
  "Someone on your mind? Why the hell can't you stop thinking about them?",
  "What crazy shit are you planning for tomorrow?",
  "What is your gut feeling telling you? Don't ignore that shit.",
  "What was the best damn part of today?",
  "What are you not saying out loud? Let it all out.",
  "What's been driving you crazy lately?",
  "Where is all this fucking stress coming from?",
  "One thing you'd change about today? Be honest.",
  "What made you feel like a badass today?",
  "What's one small thing you're actually grateful for in this mess?"
];

export const useJournalPrompts = () => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(-1);
  const [maturityMode, setMaturityMode] = useState<boolean>(false);
  const { user } = useAuth();
  
  // Load user preferences from profile
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('mature_content, username')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setMaturityMode(data.mature_content || false);
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, [user]);

  // Get the appropriate prompt list based on maturity setting
  const getPromptList = () => {
    return maturityMode ? MATURE_JOURNAL_PROMPTS : CLEAN_JOURNAL_PROMPTS;
  };

  const getRandomPrompt = (): string => {
    const promptList = getPromptList();
    // Get a random index different from the current one
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * promptList.length);
    } while (newIndex === currentPromptIndex && promptList.length > 1);
    
    setCurrentPromptIndex(newIndex);
    return promptList[newIndex];
  };

  return { getRandomPrompt };
};
