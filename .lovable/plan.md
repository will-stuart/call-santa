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

## 4. Newest voice model
- I'll confirm in ElevenLabs' current docs which newest voice model is actually available for live agents (I can't confirm a "v4" from here) and whether it can be set from the app.
- If it can, the app selects it per call; otherwise you'll get exact steps to switch it on in your ElevenLabs agent.

## 5. Quick health check
- Re-check the call screen on phones, the ending/cleanup of calls (minutes always saved), and error messages.

## Technical details
- `useConversation` exposes `micMuted`; pass state into the hook, add `MuteButton` in `CallButton.tsx`, label in `SantaStatus.tsx`.
- Push-to-talk = toggle `micMuted` on pointer down/up.
- Bump `@elevenlabs/react` to latest; adjust `startSession` options if the API changed; `getUserMedia({ audio: { echoCancellation, noiseSuppression, autoGainControl } })`.
- Prefetch token in parallel with ring; ring 1–1.5s.
- Model / turn settings via `overrides.tts` / agent config if latest SDK + agent security settings allow overrides; else dashboard steps.
- Prompt rules appended in `useSantaCall.ts`.
