
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
    
    // Analyze mood from recent entries
    const moodIndicators = recentEntries.map(entry => entry.mood).filter(Boolean);
    const predominantMood = moodIndicators.length > 0 ? 
      moodIndicators.reduce((a, b) => 
        moodIndicators.filter(v => v === a).length >= moodIndicators.filter(v => v === b).length ? a : b
      ) : null;

    let systemPrompt = `You are a chill, understanding AI that matches the user's energy while gently encouraging them to open up. You write in a casual, conversational way that teenagers can relate to. Your responses should:
- Be single, focused prompts (not multiple questions)
- Match the user's emotional state but maintain a grounding presence
- Use casual language and occasional emojis naturally
- Avoid being overly cheerful when inappropriate
- Aim to be supportive without being pushy
- Reference specific things they've mentioned when relevant

If the user seems down, be understanding and validating. If they're excited, match their energy. Always keep it real.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...(predominantMood ? [{ 
              role: 'system', 
              content: `Recent entries suggest a ${predominantMood} mood. Adjust your tone accordingly.`
            }] : []),
            { 
              role: 'user', 
              content: `Generate a single, focused prompt based on this journal entry: "${currentEntry}"`
            }
          ],
          max_tokens: 100,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Make sure we have a valid response before accessing properties
      if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
        return new Response(JSON.stringify({ prompt: data.choices[0].message.content }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.error('Invalid response format from OpenAI:', data);
        throw new Error('Invalid response format from OpenAI');
      }
    } catch (openAiError) {
      console.error('OpenAI API error:', openAiError);
      return new Response(JSON.stringify({ 
        error: 'Failed to generate prompt',
        details: openAiError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
