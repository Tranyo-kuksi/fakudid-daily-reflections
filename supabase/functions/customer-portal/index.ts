
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function for consistent logging
const logStep = (step, details = null) => {
  console.log(`[CUSTOMER-PORTAL] ${step}${details ? ': ' + JSON.stringify(details) : ''}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Fetch environment variables
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Log environment variable status
    logStep("Environment variables", {
      stripeKeyAvailable: !!stripeKey,
      supabaseUrlAvailable: !!supabaseUrl,
      supabaseKeyAvailable: !!supabaseKey
    });
    
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      return new Response(
        JSON.stringify({ error: 'Stripe key not found', details: 'Please configure STRIPE_SECRET_KEY in edge function secrets' }),
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

    // Create Supabase client
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

    // Check if the user already exists in the subscribers table
    const { data: subscriber, error: subscriberError } = await supabase
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (subscriberError) {
      logStep("ERROR: Failed to fetch subscriber data", subscriberError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: subscriberError.message || 'Error fetching subscriber information' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!subscriber?.stripe_customer_id) {
      logStep("ERROR: No Stripe customer ID found for user", { userId: user.id });
      return new Response(
        JSON.stringify({ error: 'No Stripe customer found', details: 'You do not have an active subscription' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep("Found Stripe customer", { customerId: subscriber.stripe_customer_id });
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const origin = req.headers.get('origin') || 'http://localhost:5173';
    
    try {
      // Create a portal session for managing subscription
      logStep("Creating portal session");
      const session = await stripe.billingPortal.sessions.create({
        customer: subscriber.stripe_customer_id,
        return_url: `${origin}/settings`,
      });

      logStep("Portal session created", { sessionId: session.id });
      
      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (stripeError) {
      logStep("ERROR: Stripe API error", { 
        message: stripeError.message, 
        type: stripeError.type,
        code: stripeError.code 
      });
      return new Response(
        JSON.stringify({ error: 'Stripe portal error', details: stripeError.message || 'Error creating customer portal' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    logStep("UNEXPECTED ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message || 'Unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
