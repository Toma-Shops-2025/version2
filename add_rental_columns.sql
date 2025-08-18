-- Add rental-specific columns to listings table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS rent TEXT,
ADD COLUMN IF NOT EXISTS deposit DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS bathrooms INTEGER,
ADD COLUMN IF NOT EXISTS square_feet INTEGER,
ADD COLUMN IF NOT EXISTS property_type TEXT,
ADD COLUMN IF NOT EXISTS available_from DATE,
ADD COLUMN IF NOT EXISTS lease_length TEXT,
ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS utilities_included BOOLEAN DEFAULT false;

-- Add helpful comments
COMMENT ON COLUMN public.listings.rent IS 'Monthly rent amount as text for flexibility';
COMMENT ON COLUMN public.listings.deposit IS 'Security deposit amount';
COMMENT ON COLUMN public.listings.bedrooms IS 'Number of bedrooms';
COMMENT ON COLUMN public.listings.bathrooms IS 'Number of bathrooms';
COMMENT ON COLUMN public.listings.square_feet IS 'Property size in square feet'; 