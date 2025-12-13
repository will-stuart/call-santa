import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useCallLimits } from "@/hooks/useCallLimits";
import { Snowfall } from "@/components/Snowfall";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Crown, Star, Loader2, Phone, Clock } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { status, subscriptionEnd, isPremium, subscribe, manageSubscription, isLoading, refresh } = useSubscription();
  const { checkCallLimits, PREMIUM_CALLS_LIMIT, PREMIUM_MINUTES_LIMIT, FREE_CALLS_LIMIT, FREE_MINUTES_LIMIT } = useCallLimits();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [usage, setUsage] = useState<{
    callsUsed: number;
    callsLimit: number;
    minutesUsed: number;
    minutesLimit: number;
  } | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  // Refresh subscription status and usage when page loads
  useEffect(() => {
    refresh();
    loadUsage();
  }, [refresh]);

  const loadUsage = async () => {
    setIsLoadingUsage(true);
    try {
      const limits = await checkCallLimits();
      setUsage({
        callsUsed: limits.callsUsed,
        callsLimit: limits.callsLimit,
        minutesUsed: limits.minutesUsed,
        minutesLimit: limits.minutesLimit,
      });
    } catch (error) {
      console.error("Error loading usage:", error);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const handleUpgrade = async () => {
    setIsSubscribing(true);
    try {
      toast.info("Redirecting to checkout...");
      await subscribe();
    } catch (error) {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleManage = async () => {
    try {
      toast.info("Opening subscription management...");
      await manageSubscription();
    } catch (error) {
      toast.error("Failed to open portal. Please try again.");
    }
  };

  const callsPercent = usage ? Math.min((usage.callsUsed / usage.callsLimit) * 100, 100) : 0;
  const minutesPercent = usage ? Math.min((usage.minutesUsed / usage.minutesLimit) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Snowfall />

      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-foreground hover:bg-card hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-display font-bold text-foreground">
              ⚙️ Settings
            </h1>
          </div>

          {/* Usage Card */}
          <Card className="bg-card/80 backdrop-blur border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground font-display flex items-center gap-2">
                📊 Your Usage
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isPremium ? "Season Pass usage this billing period" : "Free plan usage"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsage ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : usage ? (
                <div className="space-y-6">
                  {/* Calls Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="h-4 w-4" />
                        <span className="font-body">Calls</span>
                      </div>
                      <span className="text-muted-foreground font-body">
                        {usage.callsUsed} / {usage.callsLimit} used
                      </span>
                    </div>
                    <Progress value={callsPercent} className="h-3" />
                  </div>

                  {/* Minutes Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="font-body">Minutes</span>
                      </div>
                      <span className="text-muted-foreground font-body">
                        {usage.minutesUsed} / {usage.minutesLimit} used
                      </span>
                    </div>
                    <Progress value={minutesPercent} className="h-3" />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Unable to load usage data</p>
              )}
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="bg-card/80 backdrop-blur border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground font-display flex items-center gap-2">
                {isPremium ? (
                  <>
                    <Crown className="h-5 w-5 text-accent" />
                    Season Pass Active
                  </>
                ) : (
                  <>
                    <Star className="h-5 w-5 text-muted-foreground" />
                    Free Plan
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isLoading ? (
                  "Checking subscription..."
                ) : isPremium ? (
                  `Your Season Pass is active through ${subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString() : "December 31st"}`
                ) : (
                  `${FREE_CALLS_LIMIT} free calls & ${FREE_MINUTES_LIMIT} minutes. Upgrade for more!`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : isPremium ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-4 w-4 text-accent" />
                      <span className="font-display font-semibold text-foreground">Season Pass Benefits</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 font-body">
                      <li>✓ {PREMIUM_CALLS_LIMIT} calls per month</li>
                      <li>✓ {PREMIUM_MINUTES_LIMIT} minutes per month</li>
                      <li>✓ Full Elf Dossier customization</li>
                      <li>✓ Multiple children supported</li>
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleManage}
                    className="w-full border-border text-foreground hover:bg-card hover:text-foreground font-display"
                  >
                    Manage Subscription
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-4 w-4 text-accent" />
                      <span className="font-display font-semibold text-foreground">Season Pass - $30</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 font-body">
                      <li>✓ {PREMIUM_CALLS_LIMIT} calls per month</li>
                      <li>✓ {PREMIUM_MINUTES_LIMIT} minutes per month</li>
                      <li>✓ Full Elf Dossier customization</li>
                      <li>✓ Multiple children supported</li>
                      <li>✓ Safe & family-friendly</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleUpgrade}
                    disabled={isSubscribing}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display py-6 text-lg"
                  >
                    {isSubscribing ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : null}
                    Get Your Season Pass 🎫
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Elf Dossier Link */}
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-foreground font-display">📋 Elf Dossier</CardTitle>
              <CardDescription className="text-muted-foreground">
                Add details about your children so Santa knows who he's talking to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => navigate("/children")}
                className="w-full border-border text-foreground hover:bg-card hover:text-foreground font-display"
              >
                Manage Children
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
