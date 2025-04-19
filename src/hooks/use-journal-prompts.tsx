
import { useState } from 'react';

// Pre-written journal prompts for free users
const JOURNAL_PROMPTS = [
  "Share one song or playlist you turned to today. How did it make you feel?",
  "Think back to a highlight of your week—what made it special, and how can you chase more moments like that?",
  "What's one goal you've been putting off? What's one tiny step you could take toward it tomorrow?",
  "What if you had an extra hour right now—how would you spend it?",
  "Name one person, place, or thing you're grateful for today",
  "What's one small habit you want to try tomorrow? (e.g., drink an extra glass of water, stretch for 5 minutes…)",
  "If today were a single word, it would be ______.",
  "Pick an emoji that sums up your mood right now. Why that emoji?",
  "Describe one thing you saw today that caught your attention (could be a color, a shape, a meme…). Why did it stand out?",
  "Today I felt most like myself when ______.",
  "On a scale of 1–5, how would you rate your energy today? What's one thing you could do to bump that number up by 1 tomorrow?"
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
