-- Add handyman-specific columns to listings table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS service_type TEXT,
ADD COLUMN IF NOT EXISTS rate TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS certified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add some helpful comments
COMMENT ON COLUMN public.listings.service_type IS 'Type of handyman service (e.g., Plumbing, Electrical, etc.)';
COMMENT ON COLUMN public.listings.rate IS 'Hourly rate or flat rate for the service';
COMMENT ON COLUMN public.listings.experience_years IS 'Years of experience in the field';
COMMENT ON COLUMN public.listings.certified IS 'Whether the handyman is certified';
COMMENT ON COLUMN public.listings.phone IS 'Contact phone number for the service'; 