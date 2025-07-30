-- Create the blocks table for user blocking functionality
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(blocker_id, blocked_id) -- A user can only block another user once
);

-- Enable RLS on blocks table
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blocks table
DROP POLICY IF EXISTS "Users can view their own blocks" ON blocks;
DROP POLICY IF EXISTS "Users can create their own blocks" ON blocks;
DROP POLICY IF EXISTS "Users can delete their own blocks" ON blocks;

-- Users can view blocks they created
CREATE POLICY "Users can view their own blocks" ON blocks
  FOR SELECT USING (auth.uid() = blocker_id);

-- Users can create blocks
CREATE POLICY "Users can create their own blocks" ON blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

-- Users can delete their own blocks (unblock)
CREATE POLICY "Users can delete their own blocks" ON blocks
  FOR DELETE USING (auth.uid() = blocker_id); 