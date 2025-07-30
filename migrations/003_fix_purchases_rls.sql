-- Fix RLS policies for purchases table
-- Enable RLS on purchases table if not already enabled
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can view their own purchases" ON purchases;
DROP POLICY IF EXISTS "Sellers can view purchases of their listings" ON purchases;

-- Create policy for users to insert their own purchases
CREATE POLICY "Users can insert their own purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Create policy for users to view their own purchases (as buyer)
CREATE POLICY "Users can view their own purchases" ON purchases
  FOR SELECT USING (auth.uid() = buyer_id);

-- Create policy for sellers to view purchases of their listings
CREATE POLICY "Sellers can view purchases of their listings" ON purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = purchases.listing_id 
      AND listings.seller_id = auth.uid()
    )
  );

-- Create policy for users to update their own purchases (for confirming orders)
CREATE POLICY "Users can update their own purchases" ON purchases
  FOR UPDATE USING (auth.uid() = buyer_id);

-- Create policy for sellers to update purchases of their listings (for confirming orders)
CREATE POLICY "Sellers can update purchases of their listings" ON purchases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = purchases.listing_id 
      AND listings.seller_id = auth.uid()
    )
  ); 