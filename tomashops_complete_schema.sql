-- TomaShops Complete Database Schema
-- Copy and paste this into your new Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS http;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create custom users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  fcm_token TEXT,
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0
);

-- Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT NOT NULL,
  subcategory TEXT,
  condition TEXT,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  video_url TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft', 'trashed')),
  type TEXT DEFAULT 'physical' CHECK (type IN ('physical', 'digital', 'service', 'rental', 'job')),
  rental_period TEXT,
  digital_file_url TEXT,
  tags TEXT[],
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  confirmed BOOLEAN DEFAULT false,
  payment_method TEXT,
  shipping_address TEXT,
  notes TEXT
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'purchase', 'message', 'offer', 'review')),
  read BOOLEAN DEFAULT false,
  related_id UUID, -- Can reference other tables depending on type
  data JSONB
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user1_id, user2_id, listing_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'offer'))
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  UNIQUE(user_id, listing_id)
);

-- Create offers table
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
  expires_at TIMESTAMPTZ
);

-- Create profiles table (additional user info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  location TEXT,
  website TEXT,
  social_links JSONB,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  UNIQUE(reviewer_id, listing_id)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  reported_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved'))
);

-- Create blocks table
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(blocker_id, blocked_id)
);

-- Create deletion_requests table
CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ
);

-- Create suggestions table
CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'declined'))
);

-- Create newsletter_signups table
CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table (for digital products)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_method TEXT
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for listings table
CREATE POLICY "Anyone can view active listings" ON listings FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "Users can create their own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own listings" ON listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own listings" ON listings FOR DELETE USING (auth.uid() = seller_id);

-- Create RLS policies for purchases table
CREATE POLICY "Users can insert their own purchases" ON purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can view their own purchases" ON purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can view purchases of their listings" ON purchases FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM listings 
    WHERE listings.id = purchases.listing_id 
    AND listings.seller_id = auth.uid()
  )
);
CREATE POLICY "Users can update their own purchases" ON purchases FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can update purchases of their listings" ON purchases FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM listings 
    WHERE listings.id = purchases.listing_id 
    AND listings.seller_id = auth.uid()
  )
);

-- Create RLS policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications for others" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for conversations table
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can update their own conversations" ON conversations FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create RLS policies for messages table
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages in their conversations" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = conversation_id 
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);
CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

-- Create RLS policies for favorites table
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for offers table
CREATE POLICY "Users can view offers they made or received" ON offers FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create offers" ON offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update offers they made or received" ON offers FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create RLS policies for profiles table
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for reviews table
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Create RLS policies for reports table
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (auth.uid() = reported_by);
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Create RLS policies for blocks table
CREATE POLICY "Users can view their own blocks" ON blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can create their own blocks" ON blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can delete their own blocks" ON blocks FOR DELETE USING (auth.uid() = blocker_id);

-- Create RLS policies for deletion_requests table
CREATE POLICY "Users can view their own deletion requests" ON deletion_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own deletion requests" ON deletion_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for suggestions table
CREATE POLICY "Allow public to insert suggestions" ON suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to view their own suggestions" ON suggestions FOR SELECT USING (auth.email() = email);
CREATE POLICY "Allow admins to view all suggestions" ON suggestions FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for newsletter_signups table
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_signups FOR INSERT WITH CHECK (true);

-- Create RLS policies for orders table
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
-- Geographic index (requires PostGIS extension)
-- CREATE INDEX IF NOT EXISTS idx_listings_location ON listings USING GIST(ST_Point(longitude, latitude));

CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_listing_id ON purchases(listing_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);

CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON offers(listing_id);

CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON blocks(blocked_id);

CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_category ON suggestions(category);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function for suggestion email notifications
CREATE OR REPLACE FUNCTION handle_new_suggestion()
RETURNS TRIGGER AS $$
BEGIN
  -- Note: Update the URL and API key for your new Supabase instance
  PERFORM
    net.http_post(
      url := 'https://nkkpfzqtgbpncdtyirid.supabase.co/functions/v1/send-suggestion-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"}'::jsonb,
      body := json_build_object(
        'suggestion', json_build_object(
          'name', NEW.name,
          'email', NEW.email,
          'suggestion', NEW.suggestion,
          'category', NEW.category,
          'created_at', NEW.created_at,
          'status', NEW.status
        )
      )::text
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for suggestion notifications
CREATE TRIGGER trigger_new_suggestion
  AFTER INSERT ON suggestions
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_suggestion();

-- Grant permissions
GRANT INSERT ON suggestions TO anon;
GRANT SELECT ON suggestions TO authenticated;
GRANT INSERT ON newsletter_signups TO anon;

-- Create storage buckets (run these in the Storage section of Supabase Dashboard)
-- Note: These need to be created in the Supabase Dashboard Storage section, not via SQL

-- Bucket for uploads: 'uploads'
-- Bucket for avatars: 'avatars' 
-- Bucket for digital products: 'digital-products'

-- Storage policies (these can be set in the Dashboard or via SQL after buckets are created)
-- Enable public access for uploads bucket
-- Enable authenticated access for avatars and digital-products buckets

COMMENT ON TABLE listings IS 'Main listings table for all products, services, and rentals';
COMMENT ON TABLE purchases IS 'Track all purchases and transactions';
COMMENT ON TABLE notifications IS 'User notifications system';
COMMENT ON TABLE conversations IS 'Direct messaging conversations between users';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON TABLE favorites IS 'User favorites/wishlist';
COMMENT ON TABLE offers IS 'Offers made on listings';
COMMENT ON TABLE reviews IS 'User reviews and ratings';
COMMENT ON TABLE reports IS 'User reports for safety';
COMMENT ON TABLE blocks IS 'User blocking functionality';
COMMENT ON TABLE suggestions IS 'User suggestions and feedback';

-- All done! Your database is ready for TomaShops 