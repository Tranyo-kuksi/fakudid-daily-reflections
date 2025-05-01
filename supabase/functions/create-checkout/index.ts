
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
    // Fetch environment variables
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Log for debugging
    console.log("Environment variables check:");
    console.log("- Stripe key available:", !!stripeKey);
    console.log("- Supabase URL available:", !!supabaseUrl);
    console.log("- Supabase service role key available:", !!supabaseKey);
    
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ error: 'Stripe key not found', details: 'Please configure STRIPE_SECRET_KEY in edge function secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not found', details: 'Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in edge function secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for session data
    let user = null;
    let requestData = {};
    
    try {
      requestData = await req.json();
      console.log("Request data received:", 
        requestData && requestData.session ? "Session provided in body" : "No session in body");
    } catch (e) {
      console.log("No JSON body in request");
    }
    
    // First try to get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    console.log("Auth header present:", !!authHeader);
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data, error } = await supabase.auth.getUser(token);
      
      if (!error && data.user) {
        user = data.user;
        console.log("User authenticated from auth header:", user.id);
      } else {
        console.error("Auth header validation error:", error?.message);
      }
    }
    
    // If user not found via Authorization header, try from session in request body
    if (!user && requestData.session) {
      const token = requestData.session.access_token;
      console.log("Using access token from request body");
      
      const { data, error } = await supabase.auth.getUser(token);
      
      if (!error && data.user) {
        user = data.user;
        console.log("User authenticated from request body:", user.id);
      } else {
        console.error("Request body session validation error:", error?.message);
      }
    }
    
    // If still no user, return authentication error
    if (!user) {
      console.error("No valid user found from authentication sources");
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: 'Unable to authenticate user from any source' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has a Stripe customer ID
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (subscribersError) {
      console.error("Error fetching subscriber:", subscribersError);
      // Continue even if there's an error, we'll create a new customer if needed
    }

    console.log("Subscriber data:", subscribers);

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    let customerId = subscribers?.stripe_customer_id;
    
    // If no Stripe customer exists, check if customer exists in Stripe
    if (!customerId) {
      console.log("No customer ID found, checking Stripe for existing customer");
      try {
        const customers = await stripe.customers.list({ 
          email: user.email,
          limit: 1 
        });
        
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          console.log("Found existing Stripe customer:", customerId);
          
          // Update subscriber record with the found customer ID
          await supabase
            .from('subscribers')
            .upsert({
              user_id: user.id,
              email: user.email,
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        } else {
          console.log("No existing Stripe customer found, will create one during checkout");
        }
      } catch (stripeError) {
        console.error("Error checking Stripe for customer:", stripeError);
        return new Response(
          JSON.stringify({ 
            error: 'Stripe API error', 
            details: stripeError.message || 'Error communicating with Stripe'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log("Using existing customer ID:", customerId);
    }

    // Create Checkout session
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    console.log("Creating checkout session with origin:", origin);
    
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Premium Subscription',
                description: 'AI journaling features with unlimited prompts',
              },
              unit_amount: 399, // $3.99
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${origin}/settings?checkout=success`,
        cancel_url: `${origin}/settings?checkout=canceled`,
      });

      console.log("Checkout session created:", session.id);

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (stripeError) {
      console.error("Error creating Stripe checkout session:", stripeError);
      return new Response(
        JSON.stringify({ 
          error: 'Stripe checkout error', 
          details: stripeError.message || 'Error creating checkout session'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Unexpected error in create-checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
