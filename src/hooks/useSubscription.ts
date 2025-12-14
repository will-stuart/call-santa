import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionState {
  status: 'free' | 'premium' | 'loading';
  subscriptionEnd: string | null;
  isLoading: boolean;
}

export const useSubscription = () => {
  const { user, isSignedIn } = useUser();
  const [state, setState] = useState<SubscriptionState>({
    status: 'loading',
    subscriptionEnd: null,
    isLoading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!isSignedIn || !user) {
      setState({ status: 'free', subscriptionEnd: null, isLoading: false });
      return;
    }

    try {
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) {
        setState({ status: 'free', subscriptionEnd: null, isLoading: false });
        return;
      }

      // Call edge function with email in body (no auth header needed)
      const { data, error } = await supabase.functions.invoke('check-subscription-clerk', {
        body: { email, clerkUserId: user.id },
      });

      if (error) throw error;

      setState({
        status: data.subscribed ? 'premium' : 'free',
        subscriptionEnd: data.subscription_end,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState({ status: 'free', subscriptionEnd: null, isLoading: false });
    }
  }, [user, isSignedIn]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const subscribe = async () => {
    if (!isSignedIn || !user) return;

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-clerk', {
        body: { email, clerkUserId: user.id },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const manageSubscription = async () => {
    if (!isSignedIn || !user) return;

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal-clerk', {
        body: { email },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      throw error;
    }
  };

  return {
    ...state,
    isPremium: state.status === 'premium',
    subscribe,
    manageSubscription,
    refresh: checkSubscription,
  };
};
