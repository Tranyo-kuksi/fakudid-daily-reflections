
import { useState } from 'react';

// Updated prompts with more question-focused and conversational tone
const JOURNAL_PROMPTS = [
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
