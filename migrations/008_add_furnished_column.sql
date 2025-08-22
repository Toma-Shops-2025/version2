-- Add 'furnished' column for rental listings
-- Run this in your Supabase SQL Editor

ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS furnished BOOLEAN DEFAULT false;

-- Ensure existing rows are set to false instead of NULL
UPDATE public.listings SET furnished = COALESCE(furnished, false) WHERE furnished IS NULL;

-- Optional: make it NOT NULL after backfilling
-- ALTER TABLE public.listings ALTER COLUMN furnished SET NOT NULL;

COMMENT ON COLUMN public.listings.furnished IS 'Whether the rental is furnished (true/false).';

-- Ask PostgREST (Supabase REST) to reload its schema cache immediately
select pg_notify('pgrst', 'reload schema'); 