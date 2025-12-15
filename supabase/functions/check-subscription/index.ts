import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Premium override for specific emails (e.g., testing/internal accounts)
    const premiumOverrideEmails = ['will.stuart1@gmail.com'];
    
    if (premiumOverrideEmails.includes(user.email)) {
      logStep("Premium override applied", { email: user.email });
      
      // Update database to premium status
      await supabaseClient
        .from('subscriptions')
        .update({ status: 'premium' })
        .eq('user_id', user.id);
      
      return new Response(JSON.stringify({
        subscribed: true,
        status: "premium",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ subscribed: false, status: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;
    let stripeSubscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      stripeSubscriptionId = subscription.id;
      
      // Defensive handling of current_period_end
      const periodEnd = subscription.current_period_end;
      logStep("Raw period end value", { periodEnd, type: typeof periodEnd });
      
      if (periodEnd && typeof periodEnd === 'number') {
        subscriptionEnd = new Date(periodEnd * 1000).toISOString();
      } else {
        logStep("Period end not a valid number, skipping date conversion");
      }
      
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Update subscriptions table
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'premium',
          stripe_customer_id: customerId,
          stripe_subscription_id: stripeSubscriptionId,
          current_period_end: subscriptionEnd,
        })
        .eq('user_id', user.id);
      
      if (updateError) {
        logStep("Error updating subscription", { error: updateError.message });
      } else {
        logStep("Database updated successfully");
      }
    } else {
      logStep("No active subscription found");
      
      // Reset subscription status in database when no active subscription
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'free',
          stripe_subscription_id: null,
          current_period_end: null,
        })
        .eq('user_id', user.id);
      
      if (updateError) {
        logStep("Error resetting subscription status", { error: updateError.message });
      } else {
        logStep("Database reset to free status");
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      status: hasActiveSub ? "premium" : "free",
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
