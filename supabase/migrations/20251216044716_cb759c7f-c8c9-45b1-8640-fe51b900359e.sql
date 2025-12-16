-- Remove legacy clerk_user_id columns from all tables
ALTER TABLE public.profiles DROP COLUMN IF EXISTS clerk_user_id;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS clerk_user_id;
ALTER TABLE public.children DROP COLUMN IF EXISTS clerk_user_id;
ALTER TABLE public.call_logs DROP COLUMN IF EXISTS clerk_user_id;