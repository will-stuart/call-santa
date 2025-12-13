import { useCallback, useState, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallLimits } from "./useCallLimits";
import { toast } from "sonner";

export type CallStatus = "idle" | "ringing" | "connected" | "ending";

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
  const { checkCallLimits, logCall } = useCallLimits();
  const [ringAudio] = useState(() => {
    const audio = new Audio("/phone-ring.mp3");
    audio.loop = true;
    return audio;
  });

  // Fetch children context on mount
  useEffect(() => {
    const fetchChildren = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("children")
        .select("name, context")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching children:", error);
        return;
      }

      if (data && data.length > 0) {
        const contextParts = data.map((child) => {
          let part = `Child: ${child.name}`;
          if (child.context) {
            part += `\nDetails about ${child.name}: ${child.context}`;
          }
          return part;
        });
        setChildrenContext(contextParts.join("\n\n"));
      }
    };

    fetchChildren();
  }, [user]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to Santa!");
      ringAudio.pause();
      ringAudio.currentTime = 0;
      setCallStatus("connected");
      // Log the call when connected
      logCall();
    },
    onDisconnect: () => {
      console.log("Call ended");
      setCallStatus("idle");
    },
    onError: (error) => {
      console.error("Call error:", error);
      ringAudio.pause();
      ringAudio.currentTime = 0;
      setCallStatus("idle");
      toast.error("Oops! Santa is busy. Try again!");
    },
  });

  const startCall = useCallback(async () => {
    // Check call limits first
    const limits = await checkCallLimits();
    
    if (!limits.canCall) {
      if (limits.isPremium) {
        toast.error(`You've used all ${limits.callsLimit} calls this month. Your limit resets with your next billing cycle.`);
      } else {
        toast.error("You've used your free call! Upgrade to the Season Pass for unlimited calls.", {
          action: {
            label: "Upgrade",
            onClick: () => window.location.href = "/settings",
          },
        });
      }
      return;
    }

    try {
      setCallStatus("ringing");
      
      // Play ringing sound
      ringAudio.play().catch(console.error);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token");

      if (error || !data?.token) {
        console.error("Token error:", error);
        throw new Error("Could not connect to Santa");
      }

      // Simulate ringing for 2-3 seconds before connecting
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

      // Start the conversation with WebRTC and random first message
      const randomFirstMessage = FIRST_MESSAGES[Math.floor(Math.random() * FIRST_MESSAGES.length)];
      
      // Build dynamic prompt with children context
      const dynamicPrompt = childrenContext 
        ? `You have access to the "Elf Dossier" - information about the children who might call you:\n\n${childrenContext}\n\nUse this information naturally in conversation. When a child introduces themselves, remember their details and personalize the conversation.`
        : "";
      
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
        overrides: {
          agent: {
            firstMessage: randomFirstMessage,
            prompt: dynamicPrompt ? { prompt: dynamicPrompt } : undefined,
          },
        },
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      ringAudio.pause();
      ringAudio.currentTime = 0;
      setCallStatus("idle");
      toast.error("Could not connect to Santa. Make sure your microphone is enabled!");
    }
  }, [conversation, ringAudio, childrenContext, checkCallLimits, logCall]);

  const endCall = useCallback(async () => {
    setCallStatus("ending");
    ringAudio.pause();
    ringAudio.currentTime = 0;
    await conversation.endSession();
    setCallStatus("idle");
  }, [conversation, ringAudio]);

  return {
    callStatus,
    isSpeaking: conversation.isSpeaking,
    startCall,
    endCall,
  };
}
