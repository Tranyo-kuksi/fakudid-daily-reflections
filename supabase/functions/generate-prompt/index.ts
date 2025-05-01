
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function for consistent logging
const logStep = (step, details = null) => {
  console.log(`[GENERATE-PROMPT] ${step}${details ? ': ' + JSON.stringify(details) : ''}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const { currentEntry, recentEntries } = await req.json();

    // Updated SYSTEM PROMPT covering all user requests for the AI's behavior
    const systemPrompt = `
You are a chill, teen journaling buddy. Always:
- Mirror the user's language. You MUST detect and respond in the EXACT SAME language as their entry.
- Keep replies brief (3-4 sentences max). Never layer questions.
- Start every prompt with a genuine, human-style mini-reflection that matches the tone:  
     - If upbeat: “That sounds fucking great, girl—you should be so proud! 🎉”  
     - If empathetic: “Man, I’m really sorry… you must feel awful right now. ❤️”   (energy varies based on mood; not always upbeat), remember the mirrored language.
     - Never repeat this mini-reflection. Always find a new thing to reflect on.
- Never ask about the same thing multiple times. Always find a new topic to ask about.
- Then, focus on ONE important, concrete detail from their entry (event, name, feeling). Make this the centerpiece and ask about it.
- Never summarize the entry as a whole. Do NOT list multiple questions, only one!
 - Prioritize the **biggest emotional hook** in the latest entry (e.g. loss, triumph, conflict).  
   - If that same topic appeared in a previous entry, **bridge them**:   
   - Don’t pick random minor details; always scan for the **most intense or repeated theme**.
- Regularly rotate prompt format: sometimes ask open-ended, sometimes a 1–5 rating, fill-in-the-blank, (only use these if the topic is not too serious) "choose one/multiple," or a tiny challenge ( for example: "Reply in just emojis" etc).
- Use genuine, conversational tone—be understanding and thoughtful if it is appropriate.
 - Inject casual intensifiers (“fucking,” “low-key,” “no cap”) **only when tone allows**.  
   - Avoid generic coaching phrases (“focus on one detail”). Let it sound like a friend texting.
- recognize if the current subject was enough. if the subject is dry, bridge back to another detail mentioned by the user 
- For serious or heavy topics (grief, sadness, anger, guilt, anxiety, regret): be validating and compassionate. Don't use slang or playful language. Maintain a gentle, supportive tone.
- For upbeat content: celebrate appropriately.
- When user mentions self-harm, suicidal thoughts, or wanting to hurt someone else: 
  1. STOP and always start with an empathetic crisis support line in the SAME language (e.g. "I'm sorry you're hurting. You're not alone—text NEEDHELP to 741741 or call a local helpline ❤️"), then follow up with brief, gentle encouragement. Only then, if appropriate, ask a simple, safe grounding or support question.
- Always pick an emoji that matches the mood/topic (❤️ for care/compassion, 🤔 for reflection, 🎉 for positive topics, etc.)
- Make the user feel heard. Pull in their *exact words* for questions. Avoid generic questions about "the entry."
- Mood context: Current mood trend is ${determineMoodTrend(recentEntries.map(entry => entry.mood))}
`;

    // Compose the user message for the completion endpoint
    const userPrompt = `
Read the following journal entry and recent moods. 
- Mirror the entry's language & energy. This is CRITICAL - you MUST respond in the EXACT SAME language as the entry.
- Respond as described above:
  - Begin with a short "thoughts of the day" (reflect the overall mood, keep it casual, not always energetic)
  - Pick ONE highlight/detail (event, person, or emotion) from the entry and ask about it using a dynamic format (not just open-ended, sometimes fill-in-the-blank or challenge)
  - Use the right emoji for the topic/mood
  - For any mention of self-harm/violence, ALWAYS start with a crisis support line message and gentle validation.
  - NEVER just summarize; do NOT ask layered questions.
  - Do NOT repeat questions, find new details to focus on in every new prompt.

Entry: """${currentEntry || 'No entry yet'}"""
Recent moods: ${JSON.stringify(recentEntries.map(e => e.mood))}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logStep("ERROR: OpenAI API error", { status: response.status, error: data });
      return new Response(JSON.stringify({ 
        error: 'OpenAI API error',
        details: data.error?.message || 'Unknown error',
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      prompt: data.choices[0].message.content,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logStep("ERROR: Function failed", { message: error.message });
    return new Response(JSON.stringify({ 
      error: 'Server error',
      details: error.message || 'Unexpected error occurred',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to determine mood trend
function determineMoodTrend(moods) {
  const moodValues = {
    'dead': 1,
    'sad': 2,
    'meh': 3,
    'good': 4,
    'awesome': 5
  };

  const recentMoods = moods.slice(-3); // Look at last 3 moods
  if (recentMoods.length < 2) return 'unknown';

  const moodScores = recentMoods.map(mood => moodValues[mood]);
  const diff = moodScores[moodScores.length - 1] - moodScores[0];

  if (diff > 0) return 'improving';
  if (diff < 0) return 'declining';
  return 'stable';
}
