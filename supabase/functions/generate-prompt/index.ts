
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
      `Recent entries:\n${recentEntries.map((entry) => entry.content).join('\n')}` : 
      'No previous entries';

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
            content: `You are a fun, casual, and supportive friend who helps teenagers journal. Your style is:
            - Super casual and friendly, like texting with a friend
            - Use emojis occasionally
            - Keep responses short and engaging (1-2 sentences max)
            - Ask about specific details from their entries in a casual way
            - Be encouraging but not cheesy
            - Use casual language like "hey", "cool", "awesome", etc.
            
            If no entries available, ask something fun and relatable about their day or feelings.`
          },
          {
            role: 'user',
            content: `Generate a casual, friendly prompt based on this context:
            Current entry: ${currentEntry || 'No entry yet'}
            ${entriesContext}`
          }
        ],
        temperature: 0.9,
        max_tokens: 80,
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
