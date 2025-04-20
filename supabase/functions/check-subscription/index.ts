
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

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header found");
      return new Response(
        JSON.stringify({ error: 'No authorization header', details: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User authentication error:", userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user token', details: userError?.message || 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Authenticated user:", user.id);

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Check if the user already exists in the subscribers table
    const { data: subscriber, error: subscriberError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (subscriberError) {
      console.error("Error fetching subscriber:", subscriberError);
      // Not returning an error - we'll just create a new record if needed
    }
    
    console.log("Subscriber data:", subscriber);
    
    let customerId = subscriber?.stripe_customer_id;
    
    // If no Stripe customer ID is found, try to find it in Stripe
    if (!customerId) {
      console.log("No customer ID found in database, checking Stripe for user:", user.email);
      try {
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });
        
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          console.log("Found existing Stripe customer:", customerId);
        } else {
          console.log("No existing Stripe customer found");
          // No customer found in Stripe either, so user is not subscribed
          await supabase
            .from('subscribers')
            .upsert({
              user_id: user.id,
              email: user.email,
              subscribed: false,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            
          return new Response(
            JSON.stringify({ subscribed: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (stripeError) {
        console.error("Error checking Stripe for customer:", stripeError);
        return new Response(
          JSON.stringify({ 
            error: 'Stripe API error', 
            details: stripeError.message || 'Error communicating with Stripe',
            subscribed: false 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for active subscriptions
    try {
      console.log("Checking for active subscriptions for customer:", customerId);
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      const hasActiveSubscription = subscriptions.data.length > 0;
      let subscriptionEndsAt = null;
      
      if (hasActiveSubscription) {
        subscriptionEndsAt = new Date(subscriptions.data[0].current_period_end * 1000).toISOString();
        console.log("Active subscription found, ending at:", subscriptionEndsAt);
      } else {
        console.log("No active subscription found");
      }

      // Update subscriber record in Supabase
      await supabase
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: user.email,
          stripe_customer_id: customerId,
          subscribed: hasActiveSubscription,
          subscription_end: subscriptionEndsAt,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      console.log("Subscriber record updated:", { 
        subscribed: hasActiveSubscription,
        subscription_end: subscriptionEndsAt 
      });
        
      return new Response(
        JSON.stringify({ 
          subscribed: hasActiveSubscription,
          subscription_end: subscriptionEndsAt 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (stripeError) {
      console.error("Error checking Stripe subscriptions:", stripeError);
      return new Response(
        JSON.stringify({ 
          error: 'Stripe API error', 
          details: stripeError.message || 'Error checking subscription status',
          subscribed: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Unexpected error in check-subscription:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Server error', 
        details: error.message || 'Unexpected error occurred',
        subscribed: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
