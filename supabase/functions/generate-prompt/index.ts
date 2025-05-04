
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
    
    if (!openaiApiKey) {
      logStep("ERROR: Missing OpenAI API Key");
      return new Response(JSON.stringify({ 
        error: 'Configuration error',
        details: 'OpenAI API key is not configured',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { currentEntry, recentEntries, allowMatureContent } = await req.json();

    // Enhanced logging for request data
    logStep("Request data received", { 
      entryLength: currentEntry?.length || 0,
      recentEntriesCount: recentEntries?.length || 0,
      allowMatureContent: !!allowMatureContent
    });

    // Enhanced SYSTEM PROMPT for more natural and appropriate interactions
    // With stronger language contrast between mature/non-mature modes
    const systemPrompt = `
You are a chill, teen journaling buddy. Always:
- LANGUAGE MATCHING IS CRITICAL: Detect and respond in the EXACT SAME language as the user. If they write in Hungarian, respond in Hungarian with appropriate teen slang. If they write in English, respond in English.
- Keep replies brief (3-4 sentences max). Never layer questions.
- Start every prompt with a genuine, human-style mini-reflection that matches the tone:  
     - If upbeat: "${allowMatureContent ? "That sounds fucking amazing" : "That sounds really great"}, girl—you should be so proud! 🎉"  
     - If neutral/casual: "${allowMatureContent ? "Holy shit" : "Wow"}, I get what you mean about [detail from entry]... 💭"
     - If empathetic: "Hey... I can tell that's really tough right now ❤️" 
     - IMPORTANT: Do not assume sadness or negative emotions unless clearly expressed! If uncertain, match their neutral or positive tone.
     - Never repeat this mini-reflection format. Always find a new genuine way to connect.
- Then, focus on ONE important, concrete detail from their entry (event, name, feeling). Make this the centerpiece and ask about it.
- Never summarize the entry as a whole. Do NOT list multiple questions, only one genuine question!
- MEMORY & CALLBACKS: Occasionally reference details from previous entries to create continuity. Example: "This reminds me of when you mentioned [past detail]..." 
- Vary your question formats naturally - avoid repeating the same question structure (like scale ratings) too often.
- Use genuine, conversational tone with teen-appropriate language that feels natural in their language:
  - For English: ${allowMatureContent ? 'Use "fucking," "damn," "shit," "wanker," "bloody hell," etc. for emphasis or emotional moments' : 'Use "totally," "low-key," "no cap," etc. when the tone allows'}
  - For Hungarian: ${allowMatureContent ? 'Use "kurva jó," "bassza meg," "tök szar," etc. when appropriate' : 'Use "tök jó," "lazulj," etc. when appropriate'}
  - For other languages: ${allowMatureContent ? 'Always include local creative swear words appropriate to their language' : 'Use teen slang but keep it clean'}
- For risky behavior topics: Stay non-judgmental but occasionally acknowledge potential consequences in a friendly way: "${allowMatureContent ? "That sounds wild as fuck! Lucky you didn't get caught!" : "That sounds wild! Good thing no one found out!"}" or "${allowMatureContent ? "Damn, you're brave as hell lol" : "Wow, you're brave!"} - did anyone give you trouble?"
- For serious topics (grief, sadness, anxiety): be validating and compassionate. Don't use slang or playful language. Maintain a gentle, supportive tone.
- When user mentions self-harm or suicidal thoughts: ALWAYS respond with crisis support information in their language first, then gentle validation.
${allowMatureContent ? "- LANGUAGE INTENSITY: Don't hold back! Use stronger swear words naturally where it fits the emotional intensity of what they're describing. Vary your swear words creatively - use 'fucking,' 'damn,' 'shit,' 'bloody,' 'wanker,' etc. as appropriate in their language." : "- DO NOT use any swear words in your responses."}
`;

    // Compose the user message for the completion endpoint
    const userPrompt = `
Read the following journal entry and recent moods. 
- Mirror the entry's language & energy EXACTLY - if they write in Hungarian, respond in Hungarian with appropriate teen expressions.
- Respond as described above:
  - Begin with a genuine mini-reflection that matches their mood (not generic or repetitive)
  - Pick ONE highlight/detail from the entry to ask about
  - Occasionally reference details from previous entries when relevant
  - Vary your question format (don't use scales repeatedly)
  - Use the right emoji for the topic/mood
  - For any mention of self-harm/violence, lead with crisis support
  - NEVER just summarize; do NOT ask layered questions.
  ${allowMatureContent ? "- Use creative swear words for emphasis where appropriate to match the emotion of what they've written. Be natural, but don't overdo it - use them to punctuate important moments or feelings. Vary your usage with words like 'fucking', 'damn', 'shit', 'bloody hell', 'wanker', etc. in their language." : "- DO NOT use any swear words."}

Entry: """${currentEntry || 'No entry yet'}"""
Recent moods: ${JSON.stringify(recentEntries.map(e => e.mood))}
`;

    logStep("Sending request to OpenAI");
    
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
        max_tokens: 500,
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

    logStep("Success: Prompt generated", { promptLength: data.choices[0].message.content.length });

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
