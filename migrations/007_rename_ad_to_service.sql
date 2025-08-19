-- Rename 'ad' category to 'service' in listings table
-- This updates all existing ads to be services

-- Update all listings with category 'ad' to 'service'
UPDATE listings 
SET category = 'service' 
WHERE category = 'ad';

-- Update the check constraint to include 'service' instead of 'ad'
-- First, drop the existing constraint
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;

-- Recreate the status constraint (keeping existing statuses)
ALTER TABLE listings ADD CONSTRAINT listings_status_check 
CHECK (status IN ('active', 'sold', 'draft', 'trashed'));

-- Drop the existing type constraint  
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_type_check;

-- Recreate the type constraint with 'service' instead of 'ad'
ALTER TABLE listings ADD CONSTRAINT listings_type_check 
CHECK (type IN ('physical', 'digital', 'service', 'rental', 'job')); 