import { PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CallStatus } from "@/hooks/useSantaCall";
import santaImage from "@/assets/santa.png";

interface CallButtonProps {
  callStatus: CallStatus;
  onStartCall: () => void;
  onEndCall: () => void;
}

export function CallButton({ callStatus, onStartCall, onEndCall }: CallButtonProps) {
  if (callStatus === "idle") {
    return (
      <Button
        onClick={onStartCall}
        size="lg"
        className="w-48 h-48 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl animate-pulse-glow transition-all duration-300 hover:scale-105"
      >
        <div className="flex flex-col items-center gap-3">
          <img src={santaImage} alt="Santa" className="w-16 h-16 object-contain" />
          <span className="text-xl font-display font-bold">Call Santa</span>
        </div>
      </Button>
    );
  }

  if (callStatus === "ringing") {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-48 h-48 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center animate-ring-pulse">
          <div className="flex flex-col items-center gap-3">
            <img src={santaImage} alt="Santa" className="w-16 h-16 object-contain animate-bounce-soft" />
            <span className="text-xl font-display font-bold text-primary">Calling...</span>
          </div>
        </div>
        <Button
          onClick={onEndCall}
          variant="destructive"
          size="lg"
          className="rounded-full px-8"
        >
          <PhoneOff className="w-5 h-5 mr-2" />
          Cancel
        </Button>
      </div>
    );
  }

  if (callStatus === "connected" || callStatus === "ending") {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-48 h-48 rounded-full bg-christmas-green/20 border-4 border-christmas-green flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-christmas-green flex items-center justify-center">
              <img src={santaImage} alt="Santa" className="w-10 h-10 object-contain" />
            </div>
            <span className="text-xl font-display font-bold text-christmas-green">
              {callStatus === "ending" ? "Ending..." : "Connected!"}
            </span>
          </div>
        </div>
        <Button
          onClick={onEndCall}
          variant="destructive"
          size="lg"
          className="rounded-full px-8"
          disabled={callStatus === "ending"}
        >
          <PhoneOff className="w-5 h-5 mr-2" />
          End Call
        </Button>
      </div>
    );
  }

  return null;
}
