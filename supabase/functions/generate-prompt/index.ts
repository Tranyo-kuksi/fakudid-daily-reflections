
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentEntry, recentEntries } = await req.json();
    
    // Enhanced mood analysis
    const moodIndicators = recentEntries.map(entry => entry.mood).filter(Boolean);
    const moodCounts = moodIndicators.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});
    
    // Get mood trend (improving, declining, or stable)
    const moodTrend = moodIndicators.length >= 2 ? 
      determineMoodTrend(moodIndicators) : 'unknown';

    let systemPrompt = `You are a thoughtful, empathetic AI that helps users explore their thoughts and feelings through journaling. Your role is to:

1. Create reflective, personally-tailored prompts that encourage deeper self-exploration
2. Match the user's emotional state while maintaining a grounding presence
3. Ask thought-provoking questions that help users understand their experiences better
4. Use natural, conversational language without forced enthusiasm
5. Be especially attentive to emotional patterns and recurring themes

Guidelines for your responses:
- Focus on one specific aspect or theme from their entry to explore deeper
- Frame questions in a way that invites storytelling and reflection
- Acknowledge emotions without overemphasizing them
- Maintain authenticity - avoid artificial excitement or forced positivity
- When appropriate, connect current thoughts/feelings to past experiences
- Use gentle, open-ended questions that don't pressure or lead

Always keep your prompts single and focused, but make them meaningful and thought-provoking.`;

    // Add mood context to the system prompt
    if (moodTrend !== 'unknown') {
      systemPrompt += `\n\nThe user's mood has been ${moodTrend} recently. Consider this context in your response.`;
    }

    console.log("Calling OpenAI API");
    
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      console.error("OpenAI API key is not set");
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key is not configured', 
        source: 'generate-prompt'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'system', 
            content: `Recent mood pattern: ${JSON.stringify(moodCounts)}. Use this to provide context-aware prompts.`
          },
          { 
            role: 'user', 
            content: `Generate a single, thoughtful prompt based on this journal entry: "${currentEntry || 'No entry yet'}"` 
          }
        ],
        max_tokens: 150,
        temperature: 0.7, // Slightly lower temperature for more focused responses
      }),
    });

    console.log("OpenAI API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${response.status}`,
        details: errorText,
        source: 'generate-prompt'
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log("OpenAI API response data:", JSON.stringify(data).substring(0, 200) + "...");
    
    if (data?.choices?.[0]?.message) {
      return new Response(JSON.stringify({ 
        prompt: data.choices[0].message.content,
        source: 'openai'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('Invalid response format from OpenAI:', data);
      return new Response(JSON.stringify({ 
        error: 'Invalid response format from OpenAI',
        source: 'generate-prompt'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request', 
      details: error.message,
      source: 'generate-prompt'
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
