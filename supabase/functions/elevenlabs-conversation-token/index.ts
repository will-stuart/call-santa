import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const ELEVENLABS_AGENT_ID = Deno.env.get("ELEVENLABS_AGENT_ID");

    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is not configured");
      throw new Error("ElevenLabs API key not configured");
    }

    if (!ELEVENLABS_AGENT_ID) {
      console.error("ELEVENLABS_AGENT_ID is not configured");
      throw new Error("ElevenLabs Agent ID not configured");
    }

    // Busy-line cap: keep simultaneous calls under the ElevenLabs plan's concurrency
    // limit so we never pay "burst" minutes (double rate). Calls with no saved
    // duration that started in the last 15 minutes count as live.
    const maxConcurrent = parseInt(Deno.env.get("MAX_CONCURRENT_CALLS") ?? "10", 10);
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (serviceKey && maxConcurrent > 0) {
      const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceKey);
      const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count, error: countError } = await admin
        .from("call_logs")
        .select("id", { count: "exact", head: true })
        .is("duration_seconds", null)
        .gte("started_at", since);
      if (!countError && (count ?? 0) >= maxConcurrent) {
        return new Response(
          JSON.stringify({ error: "busy", message: "Santa's line is busy right now. Try again in a minute!" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log("Fetching conversation token for agent:", ELEVENLABS_AGENT_ID);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${ELEVENLABS_AGENT_ID}`,
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully obtained conversation token for user:", user.id);

    return new Response(JSON.stringify({ token: data.token }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in elevenlabs-conversation-token:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
