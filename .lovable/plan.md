# Santa 2026 voice upgrade

## Goal
Smoother calls, a mute button so kids don't accidentally cut Santa off, better handling when someone talks over Santa, and Santa on the newest ElevenLabs voice.

## 1. Mute button
- Add a round "Mute / Unmute" button next to "End Call" during a call.
- While muted, the status pill says "You're muted – Santa can talk" and the button turns gold.
- Mute resets to off when a call ends.

## 2. Better interruption handling
- Optional "Push to talk" mode: hold the big button to speak, release to let Santa answer. Off by default, toggled during the call.
- Santa's instructions get rules for being interrupted: stop gracefully, don't repeat the whole sentence, keep answers short (2–3 sentences) so kids have natural gaps to speak.
- In the ElevenLabs agent settings (done by you, steps provided): raise turn-taking patience / lower interruption sensitivity so background noise and "umm"s don't cut Santa off.

## 3. Smoother voice
- Update the ElevenLabs voice library to the latest version (current one is 0.12, well behind).
- Ask the microphone for echo cancellation, noise suppression and auto gain, so Santa doesn't hear himself through the speaker and stop mid-sentence (a common cause of the "jerky" feel).
- Fetch the call token while the phone is ringing instead of after, and shorten the fake ring, so calls connect faster.
- Show a small "connection is weak" note if the line drops quality.

## 4. Santa on Eleven v4 Turbo
- Switch Santa's agent voice to Eleven v4 Turbo, ElevenLabs' real-time model for live calls (~100ms response). Selecting it turns on "Expressive mode" and their new turn-taking system with fewer false interruptions.
- Santa's instructions get expressive tags, e.g. [laughs] for a real "Ho ho ho", [whispers] for secrets about presents.
- Agent settings applied: Turn eagerness "Patient" (kids pause a lot), Santa's opening line can't be interrupted, longer silence wait before Santa prompts again, max call length matched to the plan's minutes.

## 5. Quick health check
- Re-check the call screen on phones, the ending/cleanup of calls (minutes always saved), and error messages.

## 6. How Santa's memory (context) is saved
Today: each child's name and notes are stored in the app's database and sent to Santa at the start of every call. Nothing from the call itself is kept, matching the Privacy page.
Upgrade:
- Notes become structured: age, wishes, pets, siblings, friends, recent wins, things to avoid. Easier for parents to fill in, easier for Santa to use naturally.
- Optional "Santa remembers" switch per child (off by default): after a call, a short summary (e.g. "asked for a red bike, dog is called Max") is saved to that child's notes, and parents can review/edit/delete it in Settings. The Privacy page gets a matching line. The call audio and full transcript are never stored.
- Santa is told which child is calling (picked before the call), so he greets them by name instead of guessing.

## 7. Cost check (60% margin goal)
ElevenLabs charges one rate per call minute whatever voice model is used, so v4 Turbo costs the same as today: about $0.08/min plus a small AI "brain" fee (~$0.003–0.01/min).

Season Pass, $30/month, worst case (customer uses all 100 minutes):
- Voice: 100 × ~$0.09 ≈ $9
- Stripe fees ≈ $1.20
- Memory summaries (if on): under $0.10
- Total ≈ $10.30 → about 66% margin. Typical customers use less, so margin is usually higher.
- Break-even line for 60%: about 120 minutes per Season Pass, so 100 minutes leaves headroom.

Risks to guard against:
- "Burst" minutes cost double ($0.16) when too many calls happen at once (e.g. Christmas Eve). At that rate a heavy user drops margin to ~43%. Plan: cap simultaneous calls in the app and show a friendly "Santa's line is busy, try in a minute" instead of paying burst rates.
- Free users cost ~$0.18 each (2 min) and pay nothing — fine as marketing, but worth watching sign-up abuse.
- Calls are hard-stopped when minutes run out (already in place; I'll double-check it ends the call live, not just blocks the next one).
- A monthly cost/margin view isn't possible from inside the app without your ElevenLabs billing; I'll add per-call minute logs you can compare against your ElevenLabs invoice.

## Technical details
- `useConversation` exposes `micMuted`; pass state into the hook, add `MuteButton` in `CallButton.tsx`, label in `SantaStatus.tsx`.
- Push-to-talk = toggle `micMuted` on pointer down/up.
- Bump `@elevenlabs/react` to latest; adjust `startSession` options if the API changed; `getUserMedia({ audio: { echoCancellation, noiseSuppression, autoGainControl } })`.
- Prefetch token in parallel with ring; ring 1–1.5s.
- Agent config updated once via ElevenLabs API (PATCH agent): `tts.model_id = eleven_v4_turbo`, `turn.turn_eagerness = patient`, `agent.disable_first_message_interruptions = true`, `turn.turn_timeout`. Run from a temporary admin-only function using the existing key; fall back to dashboard steps if refused.
- Memory: add `memory_enabled` + `call_memories` (child_id, summary, created_at) with owner-only RLS; summary built after the call from the `agent_response`/`user_transcript` events held in memory only, summarised server-side by Lovable AI, then discarded.
- Child picker before call passes `dynamicVariables`/prompt with that child's profile.
- Prompt rules appended in `useSantaCall.ts`.
