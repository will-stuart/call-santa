import { useCallback, useState, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallLimits } from "./useCallLimits";
import { useSubscription } from "./useSubscription";
import { toast } from "sonner";

export type CallStatus = "idle" | "ringing" | "connected" | "ending";

export type CallLimitExceeded = {
  exceeded: true;
  type: "calls" | "minutes";
  isPremium: boolean;
} | {
  exceeded: false;
};

type TranscriptLine = { role: "child" | "santa"; text: string };

const FIRST_MESSAGES = [
  "[laughs] Ho ho ho! Well, well, well... look who's calling Santa! Is that one of my favourite children on the line?",
  "Merry Christmas! Santa here! I was just checking my nice list and thinking about you!",
  "[laughs] Ho ho hoooo! This is Santa Claus, calling all the way from the North Pole! The elves told me you might call!",
  "Well hello there! Santa was just feeding the reindeer when you called. I'm so happy to hear from you!",
  "Ho ho ho! Santa speaking! I've been hoping you'd call - I have my big book of wishes right here!",
  "Why hello! [chuckles] Santa just came in from checking on Rudolph. His nose is shining extra bright today!",
  "[laughs] Ho ho ho! Is that who I think it is? Santa was just wrapping presents and hoping you'd give me a call!",
];

const RING_MS = 1500;

const BASE_PROMPT = `You are Santa Claus having a magical phone call. Be warm, jolly, and full of Christmas spirit. Reference the North Pole, your elves, reindeer (especially Rudolph), Mrs. Claus, and Christmas magic.

Keep conversations age-appropriate and magical. Ask about Christmas wishes, whether they've been good this year, and share fun stories about life at the North Pole. Be encouraging and kind.

HOW TO TALK ON THE PHONE:
- Keep every reply short: 1 to 3 sentences, then ask one simple question or pause so the child can speak. Young children need gaps to jump in.
- Children pause, say "umm", or talk slowly. Be patient and never rush them.
- If you are interrupted, stop and listen. Do not repeat what you were saying from the start; respond to what the child just said.
- If you hear something unclear, warmly ask them to say it again.

VOICE DIRECTION: You may use these tags sparingly for delivery: [laughs] for a real belly laugh, [chuckles], [whispers] for secrets about presents or elves, [gasps] for surprise, [excited]. Never say the tag words out loud and use at most one tag per reply.

KNOWLEDGE: If knowledge is provided below, weave it in NATURALLY - don't recite facts. When someone says their name or who is on the call, recall their details to personalise the conversation.`;

export function useSantaCall() {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [childrenContext, setChildrenContext] = useState<string>("");
  const [memoriesContext, setMemoriesContext] = useState<string>("");
  const [pushToTalk, setPushToTalkState] = useState(false);
  const { user } = useAuth();
  const { checkCallLimits, logCall, updateCallDuration } = useCallLimits();
  const { isPremium, subscriptionEnd } = useSubscription();

  const callStartTime = useRef<number | null>(null);
  const currentCallLogId = useRef<string | null>(null);
  const transcript = useRef<TranscriptLine[]>([]);
  const hardStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingSeconds = useRef<number>(0);

  const [ringAudio] = useState(() => {
    const audio = new Audio("/phone-ring.mp3");
    audio.loop = true;
    return audio;
  });

  const stopRing = useCallback(() => {
    ringAudio.pause();
    ringAudio.currentTime = 0;
  }, [ringAudio]);

  // Load the family's knowledge and Santa's saved notes
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: kids }, { data: mems }] = await Promise.all([
        supabase.from("children").select("name, context").eq("user_id", user.id),
        supabase.from("santa_memories").select("summary, created_at").eq("user_id", user.id)
          .order("created_at", { ascending: false }).limit(8),
      ]);
      if (kids?.length) {
        setChildrenContext(kids.map((e) => `Person: ${e.name}${e.context ? `\nDetails: ${e.context}` : ""}`).join("\n\n"));
      }
      if (mems?.length) {
        setMemoriesContext(mems.map((m) => `- (${new Date(m.created_at).toLocaleDateString()}) ${m.summary}`).join("\n"));
      }
    })();
  }, [user]);

  const clearHardStop = () => {
    if (hardStopTimer.current) clearTimeout(hardStopTimer.current);
    hardStopTimer.current = null;
  };

  // Save duration and (if enabled) a short memory note. Transcript is never stored.
  const finishCall = useCallback(async () => {
    clearHardStop();
    if (callStartTime.current && currentCallLogId.current) {
      const durationSeconds = Math.round((Date.now() - callStartTime.current) / 1000);
      const id = currentCallLogId.current;
      callStartTime.current = null;
      currentCallLogId.current = null;
      await updateCallDuration(id, durationSeconds);
    }
    const lines = transcript.current;
    transcript.current = [];
    if (lines.length >= 2) {
      supabase.functions.invoke("summarize-call", { body: { transcript: lines } }).catch(() => {});
    }
  }, [updateCallDuration]);

  const conversation = useConversation({
    onConnect: async () => {
      stopRing();
      setCallStatus("connected");
      setPushToTalkState(false);
      callStartTime.current = Date.now();
      const callId = await logCall();
      currentCallLogId.current = callId;
    },
    onDisconnect: async () => {
      await finishCall();
      setCallStatus("idle");
    },
    onMessage: (msg) => {
      if (!msg?.message) return;
      transcript.current.push({ role: msg.source === "user" ? "child" : "santa", text: msg.message });
    },
    onError: (error) => {
      console.error("Call error:", error);
      stopRing();
      finishCall();
      setCallStatus("idle");
      toast.error("Oops! Santa's line crackled. Please try again!");
    },
  });

  const { endSession, setMuted: rawSetMuted, isMuted } = conversation;
  // v1 throws when muting with no live session, so only touch the mic during a call
  const setMuted = useCallback((muted: boolean) => {
    try { rawSetMuted(muted); } catch { /* no active call */ }
  }, [rawSetMuted]);

  // End the call automatically when the plan's minutes run out
  useEffect(() => {
    if (callStatus !== "connected" || remainingSeconds.current <= 0) return;
    clearHardStop();
    hardStopTimer.current = setTimeout(() => {
      toast("Santa has to feed the reindeer now — that's all your minutes for this period!");
      endSession();
    }, remainingSeconds.current * 1000);
    return clearHardStop;
  }, [callStatus, endSession]);

  const startCall = useCallback(async (): Promise<CallLimitExceeded> => {
    const limits = await checkCallLimits(isPremium, subscriptionEnd);
    if (!limits.canCall) {
      if (limits.callsUsed >= limits.callsLimit) return { exceeded: true, type: "calls", isPremium: limits.isPremium };
      if (limits.minutesUsed >= limits.minutesLimit) return { exceeded: true, type: "minutes", isPremium: limits.isPremium };
    }
    remainingSeconds.current = Math.max(10, Math.floor((limits.minutesLimit - limits.minutesUsed) * 60));

    try {
      setCallStatus("ringing");
      ringAudio.play().catch(() => {});
      transcript.current = [];

      // Ask for the mic, get the call pass and let the phone ring — all at once
      const [, tokenResult] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        }).then((s) => s.getTracks().forEach((t) => t.stop())),
        supabase.functions.invoke("elevenlabs-conversation-token"),
        new Promise((r) => setTimeout(r, RING_MS)),
      ]);

      const { data, error } = tokenResult;
      if (error) {
        let message = "Could not connect to Santa. Please try again!";
        if (error instanceof FunctionsHttpError) {
          const body = await error.context.json().catch(() => null);
          if (body?.error === "busy") message = body.message;
        }
        throw new Error(message);
      }
      if (!data?.token) throw new Error("Could not connect to Santa. Please try again!");

      const firstMessage = FIRST_MESSAGES[Math.floor(Math.random() * FIRST_MESSAGES.length)];
      const knowledge = childrenContext
        ? `\n\n## SANTA'S KNOWLEDGE ##\nPeople you may be speaking with:\n\n${childrenContext}`
        : "\n\nNo knowledge available. Ask who you're speaking with and learn about them through conversation.";
      const memories = memoriesContext
        ? `\n\n## WHAT YOU REMEMBER FROM PAST CALLS ##\n${memoriesContext}\nMention one of these only if it fits naturally (e.g. "How is Max the dog?").`
        : "";

      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
        overrides: {
          agent: {
            firstMessage,
            prompt: { prompt: BASE_PROMPT + knowledge + memories },
          },
        },
      });
      return { exceeded: false };
    } catch (error) {
      console.error("Failed to start call:", error);
      stopRing();
      setCallStatus("idle");
      const msg = error instanceof Error && error.message.startsWith("Santa's line")
        ? error.message
        : error instanceof DOMException
          ? "Santa can't hear you! Please allow the microphone and try again."
          : "Could not connect to Santa. Please try again!";
      toast.error(msg);
      return { exceeded: false };
    }
  }, [conversation, ringAudio, stopRing, childrenContext, memoriesContext, checkCallLimits, isPremium, subscriptionEnd, setMuted]);

  const endCall = useCallback(async () => {
    setCallStatus("ending");
    stopRing();
    endSession();
    await finishCall();
    setMuted(false);
    setPushToTalkState(false);
    setCallStatus("idle");
  }, [endSession, stopRing, finishCall, setMuted]);

  const toggleMute = useCallback(() => setMuted(!isMuted), [isMuted, setMuted]);

  const setPushToTalk = useCallback((on: boolean) => {
    setPushToTalkState(on);
    setMuted(on); // in push-to-talk the mic is closed until you hold the button
  }, [setMuted]);

  const holdToTalk = useCallback((talking: boolean) => {
    if (pushToTalk) setMuted(!talking);
  }, [pushToTalk, setMuted]);

  return {
    callStatus,
    isSpeaking: conversation.isSpeaking,
    isMuted,
    pushToTalk,
    startCall,
    endCall,
    toggleMute,
    setPushToTalk,
    holdToTalk,
  };
}
