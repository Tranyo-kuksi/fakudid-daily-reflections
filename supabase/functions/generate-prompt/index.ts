
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
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

    const data = await response.json();
    return new Response(JSON.stringify({ prompt: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
