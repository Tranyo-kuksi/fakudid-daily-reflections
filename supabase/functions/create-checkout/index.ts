
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

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    console.error("Missing STRIPE_SECRET_KEY");
    return new Response(
      JSON.stringify({ error: 'Stripe key not found' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // For debugging
    console.log("Starting checkout creation process");

    // Create Supabase client using the service role key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    console.log("Supabase URL and key available:", !!supabaseUrl, !!supabaseKey);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header found");
      throw new Error('No authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log("Authenticating user with token");
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User authentication error:", userError);
      throw new Error('Invalid user token');
    }
    
    console.log("User authenticated:", user.id);

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
    } else {
      console.log("Using existing customer ID:", customerId);
    }

    // Create Checkout session
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    console.log("Creating checkout session with origin:", origin);
    
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
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
