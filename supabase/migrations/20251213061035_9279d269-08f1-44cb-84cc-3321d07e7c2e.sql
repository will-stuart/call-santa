-- Allow users to update their own call logs (for duration)
CREATE POLICY "Users can update their own call logs"
ON public.call_logs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);