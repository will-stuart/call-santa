import { Snowfall } from "@/components/Snowfall";
import { CallButton } from "@/components/CallButton";
import { SantaStatus } from "@/components/SantaStatus";
import { useSantaCall } from "@/hooks/useSantaCall";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  const { callStatus, isSpeaking, startCall, endCall } = useSantaCall();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />
      
      {/* Top bar */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          className="text-foreground hover:bg-card"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-foreground hover:bg-card"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      
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
