import { useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export function useClerkSync() {
  const { user, isSignedIn } = useUser();

  const syncUser = useCallback(async () => {
    if (!isSignedIn || !user) return null;

    const clerkUserId = user.id;
    const email = user.primaryEmailAddress?.emailAddress || '';

    try {
      // Check if profile already exists for this Clerk user
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('clerk_user_id', clerkUserId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking profile:', fetchError);
        return null;
      }

      if (existingProfile) {
        // Profile exists, return the user_id
        return existingProfile.user_id;
      }

      // Create new profile with a generated UUID as user_id
      const newUserId = crypto.randomUUID();
      
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert({
          user_id: newUserId,
          clerk_user_id: clerkUserId,
          email: email,
        });

      if (insertProfileError) {
        console.error('Error creating profile:', insertProfileError);
        return null;
      }

      // Create subscription record
      const { error: insertSubError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: newUserId,
          clerk_user_id: clerkUserId,
          status: 'free',
        });

      if (insertSubError) {
        console.error('Error creating subscription:', insertSubError);
      }

      return newUserId;
    } catch (error) {
      console.error('Error syncing user:', error);
      return null;
    }
  }, [user, isSignedIn]);

  const getInternalUserId = useCallback(async (): Promise<string | null> => {
    if (!isSignedIn || !user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('clerk_user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      // Try to sync first
      return await syncUser();
    }

    return data.user_id;
  }, [user, isSignedIn, syncUser]);

  return {
    syncUser,
    getInternalUserId,
    clerkUserId: user?.id || null,
    email: user?.primaryEmailAddress?.emailAddress || null,
  };
}
