import { Phone, PhoneOff, Mic, MicOff, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CallStatus } from "@/hooks/useSantaCall";

interface CallButtonProps {
  callStatus: CallStatus;
  onStartCall: () => void;
  onEndCall: () => void;
  isMuted?: boolean;
  pushToTalk?: boolean;
  onToggleMute?: () => void;
  onTogglePushToTalk?: () => void;
  onHoldToTalk?: (talking: boolean) => void;
}

export function CallButton({ callStatus, onStartCall, onEndCall, isMuted, pushToTalk, onToggleMute, onTogglePushToTalk, onHoldToTalk }: CallButtonProps) {
  if (callStatus === "idle") {
    return (
      <Button
        onClick={onStartCall}
        size="lg"
        className="w-48 h-48 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl animate-pulse-glow transition-all duration-300 hover:scale-105"
      >
        <div className="flex flex-col items-center gap-3">
          <Phone className="w-16 h-16" />
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
            <Phone className="w-16 h-16 text-primary animate-bounce-soft" />
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
    const hold = (talking: boolean) => () => pushToTalk && onHoldToTalk?.(talking);
    return (
      <div className="flex flex-col items-center gap-6">
        <button
          type="button"
          onPointerDown={hold(true)}
          onPointerUp={hold(false)}
          onPointerLeave={hold(false)}
          onPointerCancel={hold(false)}
          onContextMenu={(e) => pushToTalk && e.preventDefault()}
          disabled={!pushToTalk}
          className={`w-48 h-48 rounded-full border-4 flex items-center justify-center select-none touch-none transition-all duration-150 ${
            pushToTalk && !isMuted
              ? "bg-christmas-gold/30 border-christmas-gold scale-105"
              : "bg-christmas-green/20 border-christmas-green"
          } ${pushToTalk ? "cursor-pointer" : "cursor-default"}`}
          aria-label={pushToTalk ? "Hold to talk to Santa" : "Connected to Santa"}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${pushToTalk && !isMuted ? "bg-christmas-gold" : "bg-christmas-green"}`}>
              {pushToTalk ? <Mic className="w-8 h-8 text-primary-foreground" /> : <Phone className="w-8 h-8 text-primary-foreground" />}
            </div>
            <span className={`text-xl font-display font-bold ${pushToTalk && !isMuted ? "text-christmas-gold" : "text-christmas-green"}`}>
              {callStatus === "ending" ? "Ending..." : pushToTalk ? (isMuted ? "Hold to talk" : "Talking...") : "Connected!"}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-4">
          {!pushToTalk && (
            <Button
              onClick={onToggleMute}
              size="lg"
              variant="outline"
              aria-pressed={isMuted}
              className={`rounded-full w-14 h-14 p-0 ${isMuted ? "bg-christmas-gold text-background border-christmas-gold hover:bg-christmas-gold/90 hover:text-background" : "hover:bg-muted hover:text-foreground"}`}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
          )}
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
          <Button
            onClick={onTogglePushToTalk}
            size="lg"
            variant="outline"
            aria-pressed={pushToTalk}
            className={`rounded-full w-14 h-14 p-0 ${pushToTalk ? "bg-christmas-gold text-background border-christmas-gold hover:bg-christmas-gold/90 hover:text-background" : "hover:bg-muted hover:text-foreground"}`}
            aria-label={pushToTalk ? "Turn off hold to talk" : "Turn on hold to talk"}
            title="Hold to talk"
          >
            <Hand className="w-6 h-6" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
