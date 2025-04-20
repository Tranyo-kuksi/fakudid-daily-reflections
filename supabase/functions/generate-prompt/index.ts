
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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

    // Fetch environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Log environment variable status
    logStep("Environment variables", {
      openaiKeyAvailable: !!openaiApiKey,
      supabaseUrlAvailable: !!supabaseUrl,
      supabaseKeyAvailable: !!supabaseKey
    });

    if (!openaiApiKey) {
      logStep("ERROR: OPENAI_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not found', details: 'Please configure OPENAI_API_KEY in edge function secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!supabaseUrl || !supabaseKey) {
      logStep("ERROR: SUPABASE credentials missing");
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not found', details: 'Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in edge function secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client using the service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(
        JSON.stringify({ error: 'No authorization header', details: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    logStep("Authenticating user with token");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      logStep("ERROR: User authentication failed", userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user token', details: userError?.message || 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user has an active subscription
    const { data: subscriber, error: subscriberError } = await supabase
      .from('subscribers')
      .select('subscribed')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (subscriberError) {
      logStep("ERROR: Failed to fetch subscriber data", subscriberError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: subscriberError.message || 'Error checking subscription status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If subscriber record doesn't exist or subscribed is false, restrict access
    if (!subscriber?.subscribed) {
      logStep("ERROR: User doesn't have active subscription", { userId: user.id });
      return new Response(JSON.stringify({ 
        error: 'Subscription required', 
        subscription_required: true,
        details: 'Active subscription is required to use AI prompts',
        source: 'generate-prompt'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep("Subscription verified", { userId: user.id, subscribed: subscriber.subscribed });

    try {
      const { currentEntry, recentEntries } = await req.json();
      logStep("Request data received", { 
        currentEntryLength: currentEntry?.length || 0,
        recentEntriesCount: recentEntries?.length || 0 
      });
      
      // Enhanced mood analysis
      const moodIndicators = recentEntries.map(entry => entry.mood).filter(Boolean);
      const moodCounts = moodIndicators.reduce((acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {});
      
      // Get mood trend (improving, declining, or stable)
      const moodTrend = moodIndicators.length >= 2 ? 
        determineMoodTrend(moodIndicators) : 'unknown';

      logStep("Mood analysis", { moodCounts, moodTrend });

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

      logStep("Calling OpenAI API");
      
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

      logStep("OpenAI API response status", { status: response.status });
      
      if (!response.ok) {
        const errorText = await response.text();
        logStep("ERROR: OpenAI API error", { status: response.status, error: errorText });
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
      logStep("OpenAI API response received", { 
        modelUsed: data.model,
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens
      });
      
      if (data?.choices?.[0]?.message) {
        logStep("Successfully generated prompt");
        return new Response(JSON.stringify({ 
          prompt: data.choices[0].message.content,
          source: 'openai'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        logStep("ERROR: Invalid response format from OpenAI", data);
        return new Response(JSON.stringify({ 
          error: 'Invalid response format from OpenAI',
          details: 'The API response did not contain the expected data structure',
          source: 'generate-prompt'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      logStep("ERROR: Processing request failed", { message: error.message });
      return new Response(JSON.stringify({ 
        error: 'Failed to process request', 
        details: error.message,
        source: 'generate-prompt'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    logStep("UNEXPECTED ERROR", { message: error.message });
    return new Response(JSON.stringify({ 
      error: 'Server error', 
      details: error.message || 'Unexpected error occurred',
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
