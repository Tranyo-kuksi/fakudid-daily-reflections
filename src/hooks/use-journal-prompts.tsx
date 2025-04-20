
import { useState } from 'react';

// Updated prompts with more question-focused and conversational tone
const JOURNAL_PROMPTS = [
  "What's on your mind today? Spill it.",
  "Something changed today - what was it?",
  "Real talk - what's bugging you right now?",
  "That feeling you can't shake - what's it about?",
  "Three words to describe today. Why those?",
  "Low-key, what's one win from today?",
  "Something you need to get off your chest?",
  "Fill in: Today made me feel ___ because ___",
  "You doing okay? What do you need right now?",
  "What's keeping you up at night lately?",
  "Someone on your mind? Why them?",
  "What's the move for tomorrow? Any plans?",
  "That gut feeling - what's it telling you?",
  "Quick check-in: what's the best part of today?",
  "Something you're not saying out loud - what is it?",
  "Need to vent? What's been frustrating you?",
  "That stress you're carrying - where's it from?",
  "One thing you'd change about today? Why?",
  "Low-key proud of yourself for what today?",
  "What's one small thing you're grateful for?"
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
