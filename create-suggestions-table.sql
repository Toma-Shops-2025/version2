-- Create suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'declined'))
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_category ON suggestions(category);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert suggestions
CREATE POLICY "Allow public to insert suggestions" ON suggestions
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated users to view their own suggestions
CREATE POLICY "Allow users to view their own suggestions" ON suggestions
  FOR SELECT USING (auth.email() = email);

-- Create policy to allow admins to view all suggestions (you can modify this based on your admin role)
CREATE POLICY "Allow admins to view all suggestions" ON suggestions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT INSERT ON suggestions TO anon;
GRANT SELECT ON suggestions TO authenticated; 