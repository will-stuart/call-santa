import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Star, Loader2, Ticket } from "lucide-react";
import { FREE_CALLS_LIMIT, FREE_MINUTES_LIMIT, PREMIUM_CALLS_LIMIT, PREMIUM_MINUTES_LIMIT } from "@/constants/limits";

interface SubscriptionCardProps {
  isPremium: boolean;
  isLoading: boolean;
  subscriptionEnd: string | null;
  isSubscribing: boolean;
  onUpgrade: () => void;
  onManage: () => void;
}

export function SubscriptionCard({
  isPremium,
  isLoading,
  subscriptionEnd,
  isSubscribing,
  onUpgrade,
  onManage,
}: SubscriptionCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur border-border mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-foreground font-display flex items-center gap-2">
              {isPremium ? (
                <>
                  <Crown className="h-5 w-5 text-accent" />
                  Season Pass Active
                </>
              ) : (
                <>
                  <Star className="h-5 w-5" />
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
          </div>
        </div>
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
              onClick={onManage}
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
              onClick={onUpgrade}
              disabled={isSubscribing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display py-6 text-lg"
            >
              {isSubscribing ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Ticket className="h-5 w-5 mr-2" />
              )}
              Get Your Season Pass
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
