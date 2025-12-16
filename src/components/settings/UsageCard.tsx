import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Phone, Clock, Loader2 } from "lucide-react";
import type { UsageData } from "@/types";

interface UsageCardProps {
  isPremium: boolean;
  isLoading: boolean;
  usage: UsageData | null;
}

export function UsageCard({ isPremium, isLoading, usage }: UsageCardProps) {
  const callsPercent = usage ? Math.min((usage.callsUsed / usage.callsLimit) * 100, 100) : 0;
  const minutesPercent = usage ? Math.min((usage.minutesUsed / usage.minutesLimit) * 100, 100) : 0;

  return (
    <Card className="bg-card/80 backdrop-blur border-border mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-foreground font-display flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Your Usage
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isPremium ? "Season Pass usage this billing period" : "Free plan usage"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
  );
}
