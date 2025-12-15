-- Drop the overly permissive service role policy on profiles
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;

-- Create proper user-scoped policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Drop overly permissive policies on other tables
DROP POLICY IF EXISTS "Service role can manage children" ON public.children;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can manage call_logs" ON public.call_logs;

-- Create proper user-scoped policies for children (knowledge entries)
CREATE POLICY "Users can view their own children"
  ON public.children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own children"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children"
  ON public.children FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children"
  ON public.children FOR DELETE
  USING (auth.uid() = user_id);

-- Create proper user-scoped policies for subscriptions (read-only for users)
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Create proper user-scoped policies for call_logs
CREATE POLICY "Users can view their own call logs"
  ON public.call_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own call logs"
  ON public.call_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own call logs"
  ON public.call_logs FOR UPDATE
  USING (auth.uid() = user_id);