-- Add 'location_name' column for storing formatted location addresses
-- Run this in your Supabase SQL Editor

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS location_name TEXT;

COMMENT ON COLUMN public.listings.location_name IS 'Formatted location name/address for display purposes.';

-- Ask PostgREST (Supabase REST) to reload its schema cache immediately
select pg_notify('pgrst', 'reload schema'); 