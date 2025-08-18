-- Fix RLS policies for listings table
-- This fixes the issue where users cannot create handyman listings due to RLS policy violations

-- Enable RLS on listings table if not already enabled
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Users can create their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

-- Create comprehensive SELECT policy
-- Users can view:
-- 1. All active listings (for browsing)
-- 2. All their own listings (regardless of status)
-- 3. All sold/completed listings (for historical browsing)
CREATE POLICY "Users can view listings" ON listings
  FOR SELECT USING (
    status IN ('active', 'sold') OR seller_id = auth.uid()
  );

-- Create INSERT policy
-- Users can create listings where they are the seller
CREATE POLICY "Users can create their own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Create UPDATE policy
-- Users can update their own listings
CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = seller_id);

-- Create DELETE policy  
-- Users can delete their own listings
CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (auth.uid() = seller_id); 