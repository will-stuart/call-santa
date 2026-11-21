
## Voice calls
- `@elevenlabs/react` v1+: `useConversation` must be inside `ConversationProvider` (wrapped in `src/pages/Index.tsx`). Why: v1 hooks throw outside the provider.
- Agent TTS model and turn-taking are set in the ElevenLabs agent, not via client overrides. Why: unpermitted overrides make sessions fail to connect.
- Concurrent calls are capped in `elevenlabs-conversation-token` via `MAX_CONCURRENT_CALLS` (default 10). Why: exceeding ElevenLabs concurrency bills burst minutes at 2x, breaking the margin target.
- Call transcripts live only in memory; only an opt-in short summary is stored in `santa_memories`. Why: privacy promise.
- Assemble call prompts with `buildSantaPrompt` in `src/lib/santaPrompt.ts`, placing safety instructions after family context; provider-backed behavioral tests must use this same builder. Why: call behavior and evaluations must share the instructions actually sent to Santa.
- Santa's ElevenLabs agent keeps voice recording off, 1-day retention, child-safety guardrails and the skip_turn tool on. Why: privacy promise on the Privacy page and patient listening for young kids depend on them.

## Billing
- Unlimited (no call/minute limit) accounts come from the `PREMIUM_OVERRIDE_EMAILS` secret via `check-subscription` returning `unlimited: true`. Why: keeps personal emails out of public source.
