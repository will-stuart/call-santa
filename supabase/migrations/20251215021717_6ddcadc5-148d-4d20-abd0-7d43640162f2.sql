-- Drop the unused wishes table and its permissive policies
-- This table is not used anywhere in the application and poses a security risk

DROP POLICY IF EXISTS "Anyone can view wishes" ON public.wishes;
DROP POLICY IF EXISTS "Anyone can insert wishes" ON public.wishes;
DROP POLICY IF EXISTS "Anyone can delete wishes" ON public.wishes;

DROP TABLE IF EXISTS public.wishes;