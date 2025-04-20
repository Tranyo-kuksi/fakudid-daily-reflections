
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function for consistent logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!stripeKey || !supabaseUrl || !supabaseKey) {
      const missingVars = []
      if (!stripeKey) missingVars.push('STRIPE_SECRET_KEY');
      if (!supabaseUrl) missingVars.push('SUPABASE_URL');
      if (!supabaseKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
      
      const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`;
      logStep("ERROR", { error: errorMsg });
      
      return new Response(
        JSON.stringify({ error: 'Server configuration error', details: errorMsg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logStep("ERROR", { error: "No authorization header" });
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      logStep("ERROR", { error: "Invalid user token", details: userError?.message });
      return new Response(
        JSON.stringify({ error: 'Invalid user token', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    logStep("User authenticated", { id: user.id, email: user.email });

    try {
      // First check if we have a customer ID in our database
      const { data: subscriber, error: subscriberError } = await supabase
        .from('subscribers')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      logStep("Checked subscribers table", { 
        found: !!subscriber?.stripe_customer_id,
        error: subscriberError?.message 
      });
      
      let customerId = subscriber?.stripe_customer_id;
      
      // If no customer ID in our database, check Stripe
      if (!customerId) {
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });
        
        logStep("Checked Stripe for customers", { count: customers.data.length });
        
        if (customers.data.length === 0) {
          return new Response(
            JSON.stringify({ 
              error: 'No Stripe customer found', 
              details: 'You need to subscribe first before managing a subscription'
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        customerId = customers.data[0].id;
        
        // Update our database with the found customer ID
        await supabase
          .from('subscribers')
          .upsert({
            user_id: user.id,
            email: user.email,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString()
          });
          
        logStep("Updated subscribers table with Stripe customer ID");
      }

      // Now check if this customer has any active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });
      
      logStep("Checked for active subscriptions", { 
        hasActive: subscriptions.data.length > 0 
      });
      
      if (subscriptions.data.length === 0) {
        // No active subscription, but we'll still let them access the portal
        // as they might have a canceled subscription they want to reactivate
        logStep("No active subscription found, but proceeding to portal");
      }

      const origin = req.headers.get('origin') || 'http://localhost:5173';
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/settings`,
      });
      
      logStep("Created billing portal session", { 
        sessionId: session.id,
        url: session.url
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      logStep("Stripe API error", { 
        message: stripeError.message,
        type: stripeError.type
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to create customer portal session', details: stripeError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    logStep("Server error", { message: error.message });
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
