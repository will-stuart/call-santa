import { useEffect, useState } from "react";
import { ConversationProvider } from "@elevenlabs/react";
import { Snowfall } from "@/components/Snowfall";
import { CallButton } from "@/components/CallButton";
import { SantaStatus } from "@/components/SantaStatus";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { useSantaCall } from "@/hooks/useSantaCall";
import { useCallLimits } from "@/hooks/useCallLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SeasonPassModal } from "@/components/SeasonPassModal";

const Index = () => {
  const { callStatus, isSpeaking, isMuted, pushToTalk, startCall, endCall, toggleMute, setPushToTalk, holdToTalk } = useSantaCall();
  const { checkCallLimits } = useCallLimits();
  const { isLoading: isSubscriptionLoading, isPremium, subscriptionEnd } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [usage, setUsage] = useState<{
    callsUsed: number;
    callsLimit: number;
    minutesUsed: number;
    minutesLimit: number;
  } | null>(null);

  // Load usage only after subscription status is known
  useEffect(() => {
    if (isSubscriptionLoading) return;
    
    const loadUsage = async () => {
      try {
        const limits = await checkCallLimits(isPremium, subscriptionEnd);
        setUsage({
          callsUsed: limits.callsUsed,
          callsLimit: limits.callsLimit,
          minutesUsed: limits.minutesUsed,
          minutesLimit: limits.minutesLimit,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsage();
  }, [checkCallLimits, isSubscriptionLoading, isPremium, subscriptionEnd]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <Snowfall />
      
      <Header showAuthActions />
      
      {/* Main content - centered */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
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
            isMuted={isMuted}
            pushToTalk={pushToTalk}
            onToggleMute={toggleMute}
            onTogglePushToTalk={() => setPushToTalk(!pushToTalk)}
            onHoldToTalk={holdToTalk}
          />
        </div>

        {/* Speaking status */}
        <SantaStatus isSpeaking={isSpeaking} isConnected={callStatus === "connected"} isMuted={isMuted} pushToTalk={pushToTalk} />

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
          </>
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

const IndexPage = () => (
  <ConversationProvider>
    <Index />
  </ConversationProvider>
);

export default IndexPage;
