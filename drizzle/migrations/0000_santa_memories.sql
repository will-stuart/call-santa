CREATE TABLE public.santa_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  summary text NOT NULL CHECK (char_length(summary) <= 600),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.santa_memories TO authenticated;
GRANT ALL ON public.santa_memories TO service_role;
ALTER TABLE public.santa_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own memories select" ON public.santa_memories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own memories insert" ON public.santa_memories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own memories delete" ON public.santa_memories FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX santa_memories_user_idx ON public.santa_memories(user_id, created_at DESC);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS santa_remembers boolean NOT NULL DEFAULT false;