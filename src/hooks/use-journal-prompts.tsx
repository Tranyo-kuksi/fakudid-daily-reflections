
import { useState } from 'react';

// Pre-written journal prompts for free users with updated teen-friendly style
const JOURNAL_PROMPTS = [
  "What song hit different today? Why that one?",
  "Real talk - what was your highlight this week?",
  "That goal you've been putting off? What's one tiny step you could take tomorrow?",
  "If you had an extra hour right now - no cap - how would you spend it?",
  "Drop one thing you're grateful for today",
  "What small habit are you trying tomorrow? (Extra water? 5-min stretch?)",
  "Today in one word: _______",
  "Mood check - drop an emoji that matches your vibe right now",
  "Something caught your eye today - what was it?",
  "When did you feel most like yourself today?",
  "Energy level 1-5? What would bump that up by 1 tomorrow?",
  "No judgment zone: spill it",
  "Real talk — what's the move for tomorrow?",
  "Fill in the blank: Today I'm proud of myself for _______",
  "Rate your day on a scale of 'ugh' to 'fire' - why that rating?",
  "Three things on your mind right now. Go.",
  "Low-key, what's something that made you smile today?",
  "Quick check: you doing okay?",
  "If today had a soundtrack, what would be playing?",
  "Totally random, but what's one thing you want to try this week?"
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
