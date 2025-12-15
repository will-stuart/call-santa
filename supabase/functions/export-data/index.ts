import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXPORT-DATA] ${step}${detailsStr}`);
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

    // Fetch profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Fetch knowledge entries (children table)
    const { data: knowledge } = await supabaseClient
      .from("children")
      .select("name, context, created_at")
      .eq("user_id", user.id)
      .order("created_at");

    // Fetch call logs
    const { data: callLogs } = await supabaseClient
      .from("call_logs")
      .select("started_at, duration_seconds")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    // Fetch subscription
    const { data: subscription } = await supabaseClient
      .from("subscriptions")
      .select("status, current_period_start, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    const exportData = {
      exported_at: new Date().toISOString(),
      account: {
        email: user.email,
        created_at: user.created_at,
      },
      subscription: subscription ? {
        status: subscription.status,
        period_start: subscription.current_period_start,
        period_end: subscription.current_period_end,
      } : null,
      knowledge_entries: knowledge || [],
      call_history: callLogs || [],
    };

    logStep("Export complete", { 
      knowledgeCount: knowledge?.length || 0, 
      callLogCount: callLogs?.length || 0 
    });

    return new Response(JSON.stringify(exportData), {
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
