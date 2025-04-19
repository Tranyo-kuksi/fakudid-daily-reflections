
export const prewrittenPrompts = [
  "What made you smile today?",
  "Describe a challenge you faced today and how you handled it.",
  "What are three things you're grateful for today?",
  "Write about a person who had a positive impact on your day.",
  "What was the most important thing you learned today?",
  "Describe your current mood in detail. What contributed to it?",
  "What's something you're looking forward to tomorrow?",
  "Reflect on a decision you made today. Would you make the same choice again?",
  "What did you do for self-care today?",
  "Write about a moment that surprised you today.",
  "What's something you did today that you're proud of?",
  "If you could change one thing about today, what would it be?",
  "Write about a conversation that was meaningful to you today.",
  "What's a question you're pondering right now?",
  "Describe a small joy you experienced today.",
  "What did you notice today that you haven't noticed before?",
  "How did you take care of your physical health today?",
  "What boundaries did you maintain or need to establish?",
  "Describe an interaction that challenged you today.",
  "What are you hoping to accomplish tomorrow?",
];

export function getRandomPrewrittenPrompt(): string {
  const randomIndex = Math.floor(Math.random() * prewrittenPrompts.length);
  return prewrittenPrompts[randomIndex];
}
