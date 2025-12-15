import { useCallback, useState, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallLimits } from "./useCallLimits";
import { toast } from "sonner";

export type CallStatus = "idle" | "ringing" | "connected" | "ending";

export type CallLimitExceeded = {
  exceeded: true;
  type: "calls" | "minutes";
  isPremium: boolean;
} | {
  exceeded: false;
};

const FIRST_MESSAGES = [
  "Ho ho ho! Well, well, well... look who's calling Santa! Is that one of my favorite children on the line?",
  "Merry Christmas! *jingle bells* Santa here! I was just checking my nice list and thinking about you!",
  "Ho ho hoooo! *Santa laugh* This is Santa Claus, calling all the way from the North Pole! The elves told me you might call!",
  "Well hello there, little one! Santa was just feeding the reindeer when you called. I'm so happy to hear from you!",
  "Ho ho ho! *sleigh bells* Santa speaking! I've been hoping you'd call - I have my big book of wishes right here!",
  "Why hello! *warm chuckle* Santa just came in from checking on Rudolph. His nose is shining extra bright today!",
  "Ho ho ho! Is that who I think it is? Santa was just wrapping presents and hoping you'd give me a call!",
];

export function useSantaCall() {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [childrenContext, setChildrenContext] = useState<string>("");
  const { user } = useAuth();
  const { checkCallLimits, logCall, updateCallDuration } = useCallLimits();
  
  // Track call timing
  const callStartTime = useRef<number | null>(null);
  const currentCallLogId = useRef<string | null>(null);
  
  const [ringAudio] = useState(() => {
    const audio = new Audio("/phone-ring.mp3");
    audio.loop = true;
    return audio;
  });

  // Fetch knowledge context on mount
  useEffect(() => {
    const fetchKnowledge = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("children")
        .select("name, context")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching knowledge:", error);
        return;
      }

      if (data && data.length > 0) {
        const contextParts = data.map((entry) => {
          let part = `Person: ${entry.name}`;
          if (entry.context) {
            part += `\nDetails: ${entry.context}`;
          }
          return part;
        });
        setChildrenContext(contextParts.join("\n\n"));
      }
    };

    fetchKnowledge();
  }, [user]);

  // Helper to save call duration
  const saveCallDuration = useCallback(async () => {
    if (callStartTime.current && currentCallLogId.current) {
      const durationSeconds = Math.round((Date.now() - callStartTime.current) / 1000);
      await updateCallDuration(currentCallLogId.current, durationSeconds);
      callStartTime.current = null;
      currentCallLogId.current = null;
    }
  }, [updateCallDuration]);

  const conversation = useConversation({
    onConnect: async () => {
      console.log("Connected to Santa!");
      ringAudio.pause();
      ringAudio.currentTime = 0;
      setCallStatus("connected");
      
      // Log the call and track start time
      const callId = await logCall();
      currentCallLogId.current = callId;
      callStartTime.current = Date.now();
    },
    onDisconnect: async () => {
      console.log("Call ended");
      await saveCallDuration();
      setCallStatus("idle");
    },
    onError: (error) => {
      console.error("Call error:", error);
      ringAudio.pause();
      ringAudio.currentTime = 0;
      saveCallDuration();
      setCallStatus("idle");
      toast.error("Oops! Santa is busy. Try again!");
    },
  });

  const startCall = useCallback(async (): Promise<CallLimitExceeded> => {
    // Check call limits first
    const limits = await checkCallLimits();
    
    if (!limits.canCall) {
      if (limits.callsUsed >= limits.callsLimit) {
        return { exceeded: true, type: "calls", isPremium: limits.isPremium };
      }
      
      if (limits.minutesUsed >= limits.minutesLimit) {
        return { exceeded: true, type: "minutes", isPremium: limits.isPremium };
      }
    }

    try {
      setCallStatus("ringing");
      
      // Play ringing sound
      ringAudio.play().catch(console.error);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get auth session and token from edge function
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (error || !data?.token) {
        console.error("Token error:", error);
        throw new Error("Could not connect to Santa");
      }

      // Simulate ringing for 2-3 seconds before connecting
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

      // Start the conversation with WebRTC and random first message
      const randomFirstMessage = FIRST_MESSAGES[Math.floor(Math.random() * FIRST_MESSAGES.length)];
      
      // Build complete Santa personality + knowledge prompt
      const baseSantaPrompt = `You are Santa Claus having a magical phone call. Be warm, jolly, and full of Christmas spirit. Use "Ho ho ho!" laughs naturally. Reference the North Pole, your elves, reindeer (especially Rudolph), Mrs. Claus, and Christmas magic throughout the conversation.

Keep conversations age-appropriate and magical. Ask about Christmas wishes, whether they've been good this year, and share fun stories about life at the North Pole. Be encouraging and kind.

IMPORTANT: If you receive knowledge below, use that information NATURALLY in conversation - don't recite facts immediately, but weave them in organically. When someone says their name, recall their details to personalize the conversation.`;

      const knowledgeSection = childrenContext 
        ? `\n\n## SANTA'S KNOWLEDGE ##\nPeople you may be speaking with:\n\n${childrenContext}\n\nRemember: Use this information naturally. Don't immediately list what you know - let it come up organically in conversation.`
        : "\n\nNo knowledge available for this call. Ask who you're speaking with and learn about them through conversation.";

      const fullPrompt = baseSantaPrompt + knowledgeSection;
      
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
        overrides: {
          agent: {
            firstMessage: randomFirstMessage,
            prompt: { prompt: fullPrompt },
          },
        },
      });
      
      return { exceeded: false };
    } catch (error) {
      console.error("Failed to start call:", error);
      ringAudio.pause();
      ringAudio.currentTime = 0;
      setCallStatus("idle");
      toast.error("Could not connect to Santa. Make sure your microphone is enabled!");
      return { exceeded: false };
    }
  }, [conversation, ringAudio, childrenContext, checkCallLimits, logCall]);

  const endCall = useCallback(async () => {
    setCallStatus("ending");
    ringAudio.pause();
    ringAudio.currentTime = 0;
    await saveCallDuration();
    await conversation.endSession();
    setCallStatus("idle");
  }, [conversation, ringAudio, saveCallDuration]);

  return {
    callStatus,
    isSpeaking: conversation.isSpeaking,
    startCall,
    endCall,
  };
}
