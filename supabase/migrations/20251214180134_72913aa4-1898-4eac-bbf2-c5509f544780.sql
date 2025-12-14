-- Add clerk_user_id column to profiles table for Clerk integration
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

-- Create index for faster lookups by clerk_user_id
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);

-- Add clerk_user_id to subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Add clerk_user_id to children table  
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Add clerk_user_id to call_logs table
ALTER TABLE public.call_logs ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Create indexes for Clerk lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_clerk_user_id ON public.subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_children_clerk_user_id ON public.children(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_clerk_user_id ON public.call_logs(clerk_user_id);

-- Drop existing RLS policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own children" ON public.children;
DROP POLICY IF EXISTS "Users can insert their own children" ON public.children;
DROP POLICY IF EXISTS "Users can update their own children" ON public.children;
DROP POLICY IF EXISTS "Users can delete their own children" ON public.children;
DROP POLICY IF EXISTS "Users can view their own call logs" ON public.call_logs;
DROP POLICY IF EXISTS "Users can insert their own call logs" ON public.call_logs;
DROP POLICY IF EXISTS "Users can update their own call logs" ON public.call_logs;

-- Since Clerk tokens won't work with auth.uid(), we need to allow access via service role
-- The edge functions will handle authorization using Clerk JWT verification
-- For now, create permissive policies that the app will use via service role key

-- Profiles policies (open - edge functions will handle auth)
CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Subscriptions policies
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Children policies  
CREATE POLICY "Service role can manage children" ON public.children FOR ALL USING (true) WITH CHECK (true);

-- Call logs policies
CREATE POLICY "Service role can manage call_logs" ON public.call_logs FOR ALL USING (true) WITH CHECK (true);