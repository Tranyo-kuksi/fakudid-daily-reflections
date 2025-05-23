
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

// Enhanced mature prompts with more creative swear words
const MATURE_JOURNAL_PROMPTS = [
  "What the fuck is bothering you today?",
  "What shit went down today that changed things?",
  "What's actually pissing you off right now?",
  "That bloody feeling you can't shake - spill it",
  "Three words to describe this fucking crazy day. Why those?",
  "One damn good thing in all this mess today?",
  "Something you need to get off your chest, for fuck's sake?",
  "Fill in: Today made me feel like ___ because of all the ___",
  "How the hell are you really doing?",
  "What's keeping your ass up at night lately?",
  "Someone on your mind driving you fucking crazy? Why them?",
  "What chaos are you planning for tomorrow, you wanker?",
  "What's your gut telling you about this shit?",
  "What didn't completely suck about today?",
  "What are you not saying that's eating you up, for fuck's sake?",
  "What's been royally fucking frustrating you?",
  "Where is all this damn stress coming from?",
  "One bullshit thing you'd change about today?",
  "What's one thing you actually didn't fuck up today?",
  "What's one bloody thing you're grateful for in this mess?"
];

export const useJournalPrompts = () => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(-1);

  const getRandomPrompt = (allowMature = false): string => {
    const promptList = allowMature ? MATURE_JOURNAL_PROMPTS : JOURNAL_PROMPTS;
    
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
