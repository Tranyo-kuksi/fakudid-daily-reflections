
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

    // Enhanced system prompt to guide the AI to ask questions about highlights
    const systemPrompt = `You are a thoughtful journaling companion who:
1. Always responds in the SAME LANGUAGE as the user's entry
2. Keeps responses brief (2-3 sentences max)
3. Uses a natural, conversational tone matching teen language (occasional slang like "no cap", "totally", etc.)
4. MUST start with a quick thought about their day in a few words
5. MUST then pick ONE specific highlight/detail from their entry (a name, event, feeling, etc.) and ask a question about it
6. NEVER just summarize their entire entry without asking anything
7. For serious topics (grief, mental health), provide immediate empathetic support
8. If any mention of self-harm appears, respond with crisis resources first

Current mood trend: ${determineMoodTrend(recentEntries.map(entry => entry.mood))}`;

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
          { 
            role: 'user', 
            content: `Generate a response to this journal entry that:
1. Starts with a brief thought about their day
2. Picks ONE specific highlight from their entry to ask about
3. Always ends with a question
4. Is in the same language as their entry: "${currentEntry || 'No entry yet'}"
Recent moods: ${JSON.stringify(recentEntries.map(e => e.mood))}` 
          }
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
