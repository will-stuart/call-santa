import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check for active Stripe subscription
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length > 0) {
        const customerId = customers.data[0].id;
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          logStep("Active subscription found - cannot delete", { customerId });
          return new Response(
            JSON.stringify({ 
              error: "active_subscription",
              message: "Please cancel your subscription before deleting your account" 
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
      }
    }

    logStep("No active subscription, proceeding with deletion");

    // Delete user data from all tables
    const { error: childrenError } = await supabaseClient
      .from("children")
      .delete()
      .eq("user_id", user.id);
    if (childrenError) logStep("Error deleting children", { error: childrenError.message });

    const { error: callLogsError } = await supabaseClient
      .from("call_logs")
      .delete()
      .eq("user_id", user.id);
    if (callLogsError) logStep("Error deleting call_logs", { error: callLogsError.message });

    const { error: subscriptionsError } = await supabaseClient
      .from("subscriptions")
      .delete()
      .eq("user_id", user.id);
    if (subscriptionsError) logStep("Error deleting subscriptions", { error: subscriptionsError.message });

    const { error: profilesError } = await supabaseClient
      .from("profiles")
      .delete()
      .eq("user_id", user.id);
    if (profilesError) logStep("Error deleting profiles", { error: profilesError.message });

    logStep("User data deleted from all tables");

    // Delete the user from auth.users
    const { error: authDeleteError } = await supabaseClient.auth.admin.deleteUser(user.id);
    if (authDeleteError) {
      logStep("Error deleting auth user", { error: authDeleteError.message });
      throw new Error(`Failed to delete auth user: ${authDeleteError.message}`);
    }

    logStep("Account deleted successfully");

    return new Response(JSON.stringify({ success: true }), {
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
