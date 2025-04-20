
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!stripeKey || !supabaseUrl || !supabaseKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Check for Stripe customer
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      
      let hasActiveSubscription = false;
      let subscriptionEnd = null;
      let subscriptionTier = 'free';
      
      if (customers.data.length > 0) {
        const customerId = customers.data[0].id;
        
        // Check for active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          limit: 1,
        });
        
        if (subscriptions.data.length > 0) {
          hasActiveSubscription = true;
          subscriptionEnd = new Date(subscriptions.data[0].current_period_end * 1000).toISOString();
          subscriptionTier = 'premium';
        }

        // Update subscribers table
        await supabase
          .from('subscribers')
          .upsert({
            user_id: user.id,
            email: user.email,
            stripe_customer_id: customerId,
            subscribed: hasActiveSubscription,
            subscription_end: subscriptionEnd,
            updated_at: new Date().toISOString(),
          });

        // Update profiles table
        await supabase
          .from('profiles')
          .update({ 
            plan: subscriptionTier,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      return new Response(
        JSON.stringify({
          subscribed: hasActiveSubscription,
          subscription_end: subscriptionEnd,
          subscription_tier: subscriptionTier
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return new Response(
        JSON.stringify({ error: 'Failed to check subscription status', details: stripeError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
