# Upgrade Santa for 2026: safer, more patient, more expressive

## Goal
Make calls feel natural for little kids: Santa waits for them, speaks briefly, sounds warmer and more expressive, stays safe, and handles call data privately.

## 1. Privacy first (ElevenLabs agent)
- Confirm the agent's current recording and retention settings, then turn off call audio recording and set the shortest retention ElevenLabs allows (zero retention if the plan supports it with the chosen model).
- Update the Privacy page wording only if the confirmed settings change what we can truthfully say.

## 2. Child safety
- Turn on ElevenLabs content guardrails suited to a child audience.
- Add safety instructions to Santa's call instructions: no secrets, no asking for addresses, schools or other private details, no scary naughty-list threats, no encouraging dependence ("you can talk to your family too"), and gently point a child to a trusted grown-up if they share something worrying.
- Keep the existing no-gift-promises rule.

## 3. Shorter replies and real listening
- Rewrite the conversation-style part of Santa's instructions: one short warm reaction, at most one simple question, then stop. No stacked questions, no long stories unless asked.
- Gentle recovery: if unsure what the child said, ask once kindly instead of guessing.
- Use family details lightly and naturally, never as "I'm watching you".

## 4. Let Santa wait on purpose
- Add ElevenLabs' Skip Turn tool so Santa stays quiet when a child says "umm", "wait" or "let me think".
- Keep Patient listening and the 15-second silence window; move to 20 seconds if testing shows kids still get cut off.

## 5. Expressive voice upgrade
- Confirm the agent's actual current reply model and voice model (last read showed a different setup than Realtime Mini; resolve this first).
- Switch speech to the v4 Turbo expressive mode with the same Santa voice, slightly slower speed, and suggested expression cues (warm laugh, gentle, delighted, whispering).
- Check the per-minute cost against the ~60% margin target before keeping it; fall back to the previous voice model if it breaks the margin.

## 6. Testing
- Create ElevenLabs agent tests for: a one-word answer then a pause, "wait", a sibling interrupting, a repeated gift demand, a worried child, a request for private info.
- Run them, fix failures, then you do a supervised real call with the kids on iPhone.

## Technical details
- ElevenLabs changes via the connected MCP: `agents_update_operations` (recording/retention), `agents_update_guardrails`, `agents_update_skip_turn_tool`, `agents_update_turn_taking`, `agents_update_voice` (model_id eleven_v4_turbo, expressive_mode, speed ~0.95, suggested_audio_tags), `agents_create_test` + `agents_run_tests`. Read config before each write.
- App changes in `src/lib/santaPrompt.ts` (`buildSantaPrompt`): new style, recovery, wait and safety sections placed after family context, per AGENTS.md. Update `tests/test_santa_gift_promises.py` scenarios to use the same builder.
- No client overrides for voice model or turn-taking (per AGENTS.md); these stay set in the agent.
- App prompt changes need publishing; agent changes apply immediately.
