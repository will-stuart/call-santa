
## Voice calls
- `@elevenlabs/react` v1+: `useConversation` must be inside `ConversationProvider` (wrapped in `src/pages/Index.tsx`). Why: v1 hooks throw outside the provider.
- Agent TTS model and turn-taking are set in the ElevenLabs agent, not via client overrides. Why: unpermitted overrides make sessions fail to connect.
- Concurrent calls are capped in `elevenlabs-conversation-token` via `MAX_CONCURRENT_CALLS` (default 10). Why: exceeding ElevenLabs concurrency bills burst minutes at 2x, breaking the margin target.
- Call transcripts live only in memory; only an opt-in short summary is stored in `santa_memories`. Why: privacy promise.
