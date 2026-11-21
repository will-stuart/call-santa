# Fix "Could not connect to Santa"

## What's wrong
Calls reach ElevenLabs fine (the call pass is issued every time), but the app then crashes before Santa connects. Right before starting the call it tries to "unmute" the mic, and the newer ElevenLabs library refuses that when no call is running yet, so every call fails on preview, live site and iPhone alike.

## Fix
1. Stop un-muting before the call starts; start each call unmuted instead.
2. Wait for the call to actually start, so a real connection error shows a clear message instead of failing silently.
3. Make hanging up safe too: don't touch mute after the call has ended (same crash on End Call).
4. Make a real test call in the preview to confirm Santa answers and mute / hold-to-talk appear.
5. If ElevenLabs then rejects the app's custom greeting or Santa instructions, tell you exactly which security setting to switch on in your agent.

After this you'll need to publish once so the live site and iPhone get the fix.

## Technical details
- `src/hooks/useSantaCall.ts`: remove `setMuted(false)` before `conversation.startSession(...)` (v1 `setMuted` throws "No active conversation. Call startSession() first."); `await` `startSession` inside the try; reset mute state in `onConnect` instead.
- `endCall`: call `setMuted` only while `conversation.status === "connected"`, or wrap in try/catch; reset local push-to-talk state regardless.
- `toggleMute`/hold-to-talk: guard on connected status.
