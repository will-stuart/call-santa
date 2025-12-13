import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionState {
  status: 'free' | 'premium' | 'loading';
  subscriptionEnd: string | null;
  isLoading: boolean;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    status: 'loading',
    subscriptionEnd: null,
    isLoading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!user || !session) {
      setState({ status: 'free', subscriptionEnd: null, isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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
  }, [user, session]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const subscribe = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const manageSubscription = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
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
