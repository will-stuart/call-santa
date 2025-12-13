import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "./useSubscription";

interface CallLimits {
  canCall: boolean;
  callsUsed: number;
  callsLimit: number;
  isPremium: boolean;
}

export function useCallLimits() {
  const { user } = useAuth();
  const { isPremium, status, subscriptionEnd } = useSubscription();
  const [isChecking, setIsChecking] = useState(false);

  const checkCallLimits = useCallback(async (): Promise<CallLimits> => {
    if (!user) {
      return { canCall: false, callsUsed: 0, callsLimit: 0, isPremium: false };
    }

    setIsChecking(true);

    try {
      // Get call count
      let query = supabase
        .from("call_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // If premium, only count calls in current billing period
      if (isPremium && subscriptionEnd) {
        // Get period start (30 days before end)
        const periodEnd = new Date(subscriptionEnd);
        const periodStart = new Date(periodEnd);
        periodStart.setDate(periodStart.getDate() - 30);
        
        query = query.gte("started_at", periodStart.toISOString());
      }

      const { count, error } = await query;

      if (error) {
        console.error("Error checking call limits:", error);
        return { canCall: false, callsUsed: 0, callsLimit: 0, isPremium };
      }

      const callsUsed = count || 0;
      const callsLimit = isPremium ? 30 : 1; // Premium: 30 calls, Free: 1 call
      const canCall = callsUsed < callsLimit;

      return { canCall, callsUsed, callsLimit, isPremium };
    } finally {
      setIsChecking(false);
    }
  }, [user, isPremium, subscriptionEnd]);

  const logCall = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase.from("call_logs").insert({
      user_id: user.id,
      started_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error logging call:", error);
    }
  }, [user]);

  return {
    checkCallLimits,
    logCall,
    isChecking,
  };
}
