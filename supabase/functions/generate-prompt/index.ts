
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentEntry, recentEntries } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    // Prepare context from recent entries
    const entriesContext = recentEntries ? 
      `Recent journal entries context:\n${recentEntries.map((entry, index) => 
        `Entry ${index + 1}: ${entry.content}`
      ).join('\n\n')}` : 
      'No recent entry context available.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an empathetic and insightful journal prompt generator. Create deeply personalized, reflective prompts that:
            - Consider the user's recent journal entries
            - Encourage self-discovery and emotional exploration
            - Provide unique, thought-provoking questions
            - Maintain a supportive and non-judgmental tone
            
            If no recent entries are available, generate a universally engaging prompt about personal growth, emotions, or life experiences.`
          },
          {
            role: 'user',
            content: `Generate a thoughtful, personalized journal prompt. 
            Current entry content: ${currentEntry || 'No current entry'}
            
            ${entriesContext}`
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    const prompt = data.choices[0].message.content;

    return new Response(JSON.stringify({ prompt }), {
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
