
import { useState } from 'react';

// Updated prompts with more empathetic and varied tones
const JOURNAL_PROMPTS = [
  "Real talk - what's on your mind?",
  "Something's different today - what changed?",
  "Drop the truth - no filter needed",
  "That feeling you can't shake - what's it about?",
  "Three words about right now. Go.",
  "Low-key, what's bugging you?",
  "Something you need to get off your chest?",
  "Fill in: Today made me feel ___ because ___",
  "Real quick - you doing okay?",
  "That thing keeping you up - what is it?",
  "Someone on your mind? Why them?",
  "What's the move tomorrow?",
  "Unfiltered moment - what's actually going on?",
  "That gut feeling - what's it telling you?",
  "Quick check-in: where's your head at?",
  "Something you're not saying - what is it?",
  "Need to vent? Go for it.",
  "That stress you're carrying - where's it from?",
  "One thing you'd change about today?",
  "Real talk - what do you need right now?"
];

export const useJournalPrompts = () => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(-1);

  const getRandomPrompt = (): string => {
    // Get a random index different from the current one
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * JOURNAL_PROMPTS.length);
    } while (newIndex === currentPromptIndex && JOURNAL_PROMPTS.length > 1);
    
    setCurrentPromptIndex(newIndex);
    return JOURNAL_PROMPTS[newIndex];
  };

  return { getRandomPrompt };
};
