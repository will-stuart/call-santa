-- Create wishes table for storing children's present requests
CREATE TABLE public.wishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_name TEXT NOT NULL,
  present TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (but allow public access since no auth)
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert wishes (no auth required)
CREATE POLICY "Anyone can insert wishes" 
ON public.wishes 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to view wishes (for parent dashboard)
CREATE POLICY "Anyone can view wishes" 
ON public.wishes 
FOR SELECT 
USING (true);

-- Allow anyone to delete wishes (for parent to remove addressed wishes)
CREATE POLICY "Anyone can delete wishes" 
ON public.wishes 
FOR DELETE 
USING (true);