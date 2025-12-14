import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { useSubscription } from "./useSubscription";
import { useClerkSync } from "./useClerkSync";

interface CallLimits {
  canCall: boolean;
  callsUsed: number;
  callsLimit: number;
  minutesUsed: number;
  minutesLimit: number;
  isPremium: boolean;
}

// Free: 3 calls, 2 minutes | Premium: 30 calls, 100 minutes
const FREE_CALLS_LIMIT = 3;
const FREE_MINUTES_LIMIT = 2;
const PREMIUM_CALLS_LIMIT = 30;
const PREMIUM_MINUTES_LIMIT = 100;

export function useCallLimits() {
  const { user, isSignedIn } = useUser();
  const { isPremium, subscriptionEnd } = useSubscription();
  const { getInternalUserId } = useClerkSync();
  const [isChecking, setIsChecking] = useState(false);

  const checkCallLimits = useCallback(async (): Promise<CallLimits> => {
    if (!isSignedIn || !user) {
      return { canCall: false, callsUsed: 0, callsLimit: 0, minutesUsed: 0, minutesLimit: 0, isPremium: false };
    }

    setIsChecking(true);

    try {
      const internalUserId = await getInternalUserId();
      if (!internalUserId) {
        return { canCall: false, callsUsed: 0, callsLimit: 0, minutesUsed: 0, minutesLimit: 0, isPremium };
      }

      // Build base query using clerk_user_id
      let query = supabase
        .from("call_logs")
        .select("duration_seconds")
        .eq("clerk_user_id", user.id);

      // If premium, only count calls in current billing period
      if (isPremium && subscriptionEnd) {
        const periodEnd = new Date(subscriptionEnd);
        const periodStart = new Date(periodEnd);
        periodStart.setDate(periodStart.getDate() - 30);
        query = query.gte("started_at", periodStart.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error checking call limits:", error);
        return { canCall: false, callsUsed: 0, callsLimit: 0, minutesUsed: 0, minutesLimit: 0, isPremium };
      }

      const callsUsed = data?.length || 0;
      const totalSeconds = data?.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) || 0;
      const minutesUsed = Math.round((totalSeconds / 60) * 100) / 100;

      const callsLimit = isPremium ? PREMIUM_CALLS_LIMIT : FREE_CALLS_LIMIT;
      const minutesLimit = isPremium ? PREMIUM_MINUTES_LIMIT : FREE_MINUTES_LIMIT;

      const canCall = callsUsed < callsLimit && minutesUsed < minutesLimit;

      return { canCall, callsUsed, callsLimit, minutesUsed, minutesLimit, isPremium };
    } finally {
      setIsChecking(false);
    }
  }, [user, isSignedIn, isPremium, subscriptionEnd, getInternalUserId]);

  const logCall = useCallback(async (): Promise<string | null> => {
    if (!isSignedIn || !user) return null;

    const internalUserId = await getInternalUserId();
    if (!internalUserId) return null;

    const { data, error } = await supabase
      .from("call_logs")
      .insert({
        user_id: internalUserId,
        clerk_user_id: user.id,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error logging call:", error);
      return null;
    }

    return data?.id || null;
  }, [user, isSignedIn, getInternalUserId]);

  const updateCallDuration = useCallback(async (callLogId: string, durationSeconds: number) => {
    if (!callLogId) return;

    const { error } = await supabase
      .from("call_logs")
      .update({ duration_seconds: durationSeconds })
      .eq("id", callLogId);

    if (error) {
      console.error("Error updating call duration:", error);
    }
  }, []);

  return {
    checkCallLimits,
    logCall,
    updateCallDuration,
    isChecking,
    FREE_CALLS_LIMIT,
    FREE_MINUTES_LIMIT,
    PREMIUM_CALLS_LIMIT,
    PREMIUM_MINUTES_LIMIT,
  };
}
