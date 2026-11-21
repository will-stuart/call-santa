import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Builds a short "Santa remembers" note from a call transcript.
// The transcript is only held in memory here and never stored.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { data: profile } = await supabase.from("profiles").select("santa_remembers").eq("user_id", user.id).maybeSingle();
    if (!profile?.santa_remembers) return json({ skipped: true });

    const body = await req.json().catch(() => ({}));
    const transcript = Array.isArray(body.transcript) ? body.transcript : [];
    const text = transcript
      .filter((t: any) => t && (t.role === "child" || t.role === "santa") && typeof t.text === "string")
      .map((t: any) => `${t.role === "child" ? "Caller" : "Santa"}: ${t.text.slice(0, 500)}`)
      .join("\n")
      .slice(0, 12000);
    if (text.length < 40) return json({ skipped: true });

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI is not configured" }, 500);
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        max_output_tokens: 400,
        instructions:
          "You help Santa remember phone calls with children. From the transcript, write ONE short note (max 2 sentences, under 300 characters) of facts worth remembering next time: who called, wishes, pets, news, achievements, worries. Only facts the caller said. No sensitive details like addresses, phone numbers or school names. If nothing worth remembering, return an empty string.",
        input: text,
        text: {
          format: {
            type: "json_schema",
            name: "memory",
            strict: true,
            schema: { type: "object", properties: { note: { type: "string" } }, required: ["note"], additionalProperties: false },
          },
        },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("AI error", res.status, t);
      return json({ error: "Could not summarise the call", status: res.status }, res.status === 402 || res.status === 429 ? res.status : 502);
    }
    const out = await res.json();
    const raw = out.output_text ?? out.output?.flatMap((o: any) => o.content ?? []).find((c: any) => c.type === "output_text")?.text ?? "";
    let note = "";
    try { note = String(JSON.parse(raw).note || "").trim().slice(0, 300); } catch { /* ignore */ }
    if (!note) return json({ skipped: true });

    const { error } = await supabase.from("santa_memories").insert({ user_id: user.id, summary: note });
    if (error) throw error;
    return json({ saved: true, note });
  } catch (e) {
    console.error("summarize-call error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
