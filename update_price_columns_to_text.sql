-- Update price-related columns to TEXT for flexible pricing
-- Run this in your Supabase SQL Editor

-- Change price column from DECIMAL to TEXT
ALTER TABLE public.listings 
ALTER COLUMN price TYPE TEXT USING price::TEXT;

-- Update any purchases table amount column as well if needed
-- (Keeping this as DECIMAL since actual transactions should be numeric)
-- ALTER TABLE public.purchases 
-- ALTER COLUMN amount TYPE TEXT USING amount::TEXT;

-- Add helpful comment
COMMENT ON COLUMN public.listings.price IS 'Price as text to allow flexible values like "$25", "Free", "Negotiable", etc.'; 