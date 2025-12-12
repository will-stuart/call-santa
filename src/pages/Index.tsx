import { Snowfall } from "@/components/Snowfall";
import { CallButton } from "@/components/CallButton";
import { SantaStatus } from "@/components/SantaStatus";
import { useSantaCall } from "@/hooks/useSantaCall";
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  const { callStatus, isSpeaking, startCall, endCall } = useSantaCall();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-4">
            🎅 Call Santa
          </h1>
          <p className="text-xl md:text-2xl font-body text-muted-foreground">
            {callStatus === "idle" && "Tap the button to talk to Santa!"}
            {callStatus === "ringing" && "Ringing the North Pole..."}
            {callStatus === "connected" && "You're talking to Santa!"}
            {callStatus === "ending" && "Saying goodbye..."}
          </p>
        </div>

        {/* Call button */}
        <div className="mb-8">
          <CallButton
            callStatus={callStatus}
            onStartCall={startCall}
            onEndCall={endCall}
          />
        </div>

        {/* Speaking status */}
        <SantaStatus isSpeaking={isSpeaking} isConnected={callStatus === "connected"} />

        {/* Decorative elements */}
        <div className="absolute bottom-8 text-center text-muted-foreground text-sm font-body">
          <p>🎄 Merry Christmas! 🎄</p>
        </div>
      </div>

      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
