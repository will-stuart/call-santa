import { useEffect, useState } from "react";
import { Snowfall } from "@/components/Snowfall";
import { CallButton } from "@/components/CallButton";
import { SantaStatus } from "@/components/SantaStatus";
import { useSantaCall } from "@/hooks/useSantaCall";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useCallLimits } from "@/hooks/useCallLimits";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Users, Phone, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const Index = () => {
  const { callStatus, isSpeaking, startCall, endCall } = useSantaCall();
  const { signOut } = useAuth();
  const { isPremium } = useSubscription();
  const { checkCallLimits } = useCallLimits();
  const navigate = useNavigate();
  
  const [usage, setUsage] = useState<{
    callsUsed: number;
    callsLimit: number;
    minutesUsed: number;
    minutesLimit: number;
  } | null>(null);

  // Load usage on mount
  useEffect(() => {
    const loadUsage = async () => {
      const limits = await checkCallLimits();
      setUsage({
        callsUsed: limits.callsUsed,
        callsLimit: limits.callsLimit,
        minutesUsed: limits.minutesUsed,
        minutesLimit: limits.minutesLimit,
      });
      
      // Show warning if approaching limits (80%+)
      const callsPercent = (limits.callsUsed / limits.callsLimit) * 100;
      const minutesPercent = (limits.minutesUsed / limits.minutesLimit) * 100;
      
      if (callsPercent >= 80 && callsPercent < 100) {
        toast.warning(`You've used ${limits.callsUsed} of ${limits.callsLimit} calls this period.`);
      }
      if (minutesPercent >= 80 && minutesPercent < 100) {
        toast.warning(`You've used ${limits.minutesUsed} of ${limits.minutesLimit} minutes this period.`);
      }
    };
    
    loadUsage();
  }, [checkCallLimits]);

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
          onClick={() => navigate('/children')}
          className="text-foreground hover:bg-card hover:text-foreground"
          title="Elf Dossier"
        >
          <Users className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          className="text-foreground hover:bg-card hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-foreground hover:bg-card hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Subscription badge */}
      {isPremium && (
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-accent text-accent-foreground text-xs font-display px-3 py-1 rounded-full">
            ✨ Season Pass
          </span>
        </div>
      )}
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-4">
            🎅 Northline
          </h1>
          <p className="text-xl md:text-2xl font-body text-muted-foreground">
            {callStatus === "idle" && "Tap to call Santa!"}
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

        {/* Usage display */}
        {usage && callStatus === "idle" && (
          <div className="mt-8 flex gap-6 text-sm text-muted-foreground font-body">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{usage.callsLimit - usage.callsUsed} calls left</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{Math.max(0, usage.minutesLimit - usage.minutesUsed).toFixed(1)} min left</span>
            </div>
          </div>
        )}

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
