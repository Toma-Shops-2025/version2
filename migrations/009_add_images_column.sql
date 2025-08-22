-- Add 'images' column used by multiple listing creation flows
-- Run this in your Supabase SQL Editor if migrations aren't auto-applied

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN public.listings.images IS 'Array of image URLs for the listing.';

-- Ask PostgREST (Supabase REST) to reload its schema cache immediately
select pg_notify('pgrst', 'reload schema'); 