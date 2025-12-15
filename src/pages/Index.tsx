import { useEffect, useState, useRef } from "react";
import { Snowfall } from "@/components/Snowfall";
import { CallButton } from "@/components/CallButton";
import { SantaStatus } from "@/components/SantaStatus";
import { useSantaCall, CallLimitExceeded } from "@/hooks/useSantaCall";
import { useCallLimits } from "@/hooks/useCallLimits";
import { Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SeasonPassModal } from "@/components/SeasonPassModal";

const Index = () => {
  const { callStatus, isSpeaking, startCall, endCall } = useSantaCall();
  const { checkCallLimits } = useCallLimits();
  const hasShownToast = useRef(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string>("");
  
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
      
      // Show warning if approaching limits (80%+) - only once
      if (!hasShownToast.current) {
        const callsPercent = (limits.callsUsed / limits.callsLimit) * 100;
        const minutesPercent = (limits.minutesUsed / limits.minutesLimit) * 100;
        
        if (callsPercent >= 80 && callsPercent < 100) {
          toast.warning(`You've used ${limits.callsUsed} of ${limits.callsLimit} calls this period.`);
          hasShownToast.current = true;
        }
        if (minutesPercent >= 80 && minutesPercent < 100) {
          toast.warning(`You've used ${limits.minutesUsed} of ${limits.minutesLimit} minutes this period.`);
          hasShownToast.current = true;
        }
      }
    };
    
    loadUsage();
  }, [checkCallLimits]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <Snowfall />
      
      <Header showAuthActions />
      
      {/* Main content - centered */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-4">
            🎅 Call Santa
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
            onStartCall={async () => {
              const result = await startCall();
              if (result.exceeded) {
                if (result.isPremium) {
                  // Premium users - show toast about billing cycle
                  toast.error(
                    result.type === "calls" 
                      ? "You've used all your Season Pass calls this month. Your limit resets with your next billing cycle."
                      : "You've used all your Season Pass minutes this month. Your limit resets with your next billing cycle."
                  );
                } else {
                  // Free users - show upgrade modal with Santa-themed message
                  setLimitMessage(
                    result.type === "calls"
                      ? "🎅 Ho ho hold on! You've used all your free calls to the North Pole. But don't worry - it's not too late to keep the magic going!"
                      : "🎅 Oh my, the Christmas magic ran out of time! You've used all your free minutes. But fear not - more magical conversations await!"
                  );
                  setShowUpgradeModal(true);
                }
              }
            }}
            onEndCall={endCall}
          />
        </div>

        {/* Speaking status */}
        <SantaStatus isSpeaking={isSpeaking} isConnected={callStatus === "connected"} />

        {/* Usage display - only show when running low (80%+) */}
        {usage && callStatus === "idle" && (
          (usage.callsUsed / usage.callsLimit) >= 0.8 || 
          (usage.minutesUsed / usage.minutesLimit) >= 0.8
        ) && (
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
      </div>

      <Footer />

      {/* Upgrade Modal */}
      <SeasonPassModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
        customMessage={limitMessage}
      />
    </div>
  );
};

export default Index;
