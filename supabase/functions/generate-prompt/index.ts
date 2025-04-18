
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

    console.log("Calling OpenAI API with project ID: org-0t2NDqVlHUjjBHFxKM766qVj");
    
    // Get the OpenAI API key from environment variable
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      console.error("OpenAI API key is not set");
      throw new Error("OpenAI API key is not set");
    }
    
    // Make request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Organization': 'org-XQaYCCKBcAWrpgLcoAeNrqSb',
        'OpenAI-Beta': 'assistants=v2',
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
            content: `Generate a single, focused prompt based on this journal entry: "${currentEntry || 'No entry yet'}"`
          }
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });

    console.log("OpenAI API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("OpenAI API response data:", JSON.stringify(data).substring(0, 200) + "...");
    
    // Make sure we have a valid response before accessing properties
    if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
      return new Response(JSON.stringify({ 
        prompt: data.choices[0].message.content,
        source: 'openai'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('Invalid response format from OpenAI:', data);
      throw new Error('Invalid response format from OpenAI');
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
