import { useCallback, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";
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
  const [ringAudio] = useState(() => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.loop = true;
    return audio;
  });

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to Santa!");
      ringAudio.pause();
      ringAudio.currentTime = 0;
      setCallStatus("connected");
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
      
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
        overrides: {
          agent: {
            firstMessage: randomFirstMessage,
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
  }, [conversation, ringAudio]);

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
