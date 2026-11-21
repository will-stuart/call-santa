import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  FREE_CALLS_LIMIT,
  FREE_MINUTES_LIMIT,
  PREMIUM_CALLS_LIMIT,
  PREMIUM_MINUTES_LIMIT,
} from "@/constants/limits";
import type { CallLimits } from "@/types";

export function useCallLimits() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const checkCallLimits = useCallback(async (
    isPremium: boolean = false,
    subscriptionEnd: string | null = null,
    isUnlimited: boolean = false
  ): Promise<CallLimits> => {
    if (!user) {
      return { canCall: false, callsUsed: 0, callsLimit: 0, minutesUsed: 0, minutesLimit: 0, isPremium: false };
    }

    setIsChecking(true);

    try {
      // Build base query
      let query = supabase
        .from("call_logs")
        .select("duration_seconds")
        .eq("user_id", user.id);

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
      const minutesUsed = Math.round((totalSeconds / 60) * 100) / 100; // Round to 2 decimals for precision

      const callsLimit = isPremium ? PREMIUM_CALLS_LIMIT : FREE_CALLS_LIMIT;
      const minutesLimit = isPremium ? PREMIUM_MINUTES_LIMIT : FREE_MINUTES_LIMIT;

      // Unlimited accounts (PREMIUM_OVERRIDE_EMAILS, verified server-side) skip limits
      const canCall = isUnlimited || (callsUsed < callsLimit && minutesUsed < minutesLimit);

      return { canCall, callsUsed, callsLimit, minutesUsed, minutesLimit, isPremium, isUnlimited };
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  const logCall = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("call_logs")
      .insert({
        user_id: user.id,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error logging call:", error);
      return null;
    }

    return data?.id || null;
  }, [user]);

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
