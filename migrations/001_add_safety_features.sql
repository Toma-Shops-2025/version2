-- Create the reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  reported_by UUID REFERENCES auth.users(id),
  reported_user_id UUID REFERENCES auth.users(id),
  reason TEXT,
  status TEXT DEFAULT 'pending' -- e.g., pending, reviewed, resolved
);

-- Create the blocks table
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  blocker_id UUID REFERENCES auth.users(id),
  blocked_id UUID REFERENCES auth.users(id),
  UNIQUE(blocker_id, blocked_id) -- A user can only block another user once
);

-- Create the reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  listing_id UUID REFERENCES listings(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  UNIQUE(reviewer_id, listing_id) -- A user can only review a specific listing once
); 