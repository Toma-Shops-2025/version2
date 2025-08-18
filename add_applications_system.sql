-- TomaShops Built-in Job Application System
-- Copy and paste this into your Supabase SQL Editor

-- 1. Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Job and applicant info
  job_listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Application data
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  
  -- Status and management
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  employer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Prevent duplicate applications
  UNIQUE(job_listing_id, applicant_id)
);

-- 2. Create application_questions table (for custom employer questions)
CREATE TABLE IF NOT EXISTS public.application_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  job_listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'textarea', 'multiple_choice', 'yes_no')),
  required BOOLEAN DEFAULT false,
  options JSONB, -- For multiple choice questions
  order_index INTEGER DEFAULT 0
);

-- 3. Create application_answers table (for custom question responses)
CREATE TABLE IF NOT EXISTS public.application_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  question_id UUID REFERENCES application_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  UNIQUE(application_id, question_id)
);

-- 4. Add job posting preferences columns to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS use_builtin_application BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_resume_upload BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS require_cover_letter BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_reply_message TEXT;

-- 5. Enable RLS on all new tables
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_answers ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for applications table
CREATE POLICY "Applicants can view their own applications" ON applications
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Employers can view applications for their jobs" ON applications
  FOR SELECT USING (auth.uid() = employer_id);

CREATE POLICY "Applicants can create applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants can update their own applications" ON applications
  FOR UPDATE USING (auth.uid() = applicant_id);

CREATE POLICY "Employers can update applications for their jobs" ON applications
  FOR UPDATE USING (auth.uid() = employer_id);

-- 7. Create RLS policies for application_questions table
CREATE POLICY "Anyone can view questions for active jobs" ON application_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = application_questions.job_listing_id 
      AND listings.status = 'active'
    )
  );

CREATE POLICY "Employers can manage questions for their jobs" ON application_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = application_questions.job_listing_id 
      AND listings.seller_id = auth.uid()
    )
  );

-- 8. Create RLS policies for application_answers table
CREATE POLICY "Applicants can manage their own answers" ON application_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = application_answers.application_id 
      AND applications.applicant_id = auth.uid()
    )
  );

CREATE POLICY "Employers can view answers for their job applications" ON application_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = application_answers.application_id 
      AND applications.employer_id = auth.uid()
    )
  );

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_job_listing_id ON applications(job_listing_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_employer_id ON applications(employer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_application_questions_job_listing_id ON application_questions(job_listing_id);
CREATE INDEX IF NOT EXISTS idx_application_answers_application_id ON application_answers(application_id);

-- 10. Create trigger for updated_at
CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON applications 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- 11. Add helpful comments
COMMENT ON TABLE applications IS 'Job applications submitted through TomaShops built-in system';
COMMENT ON TABLE application_questions IS 'Custom questions employers can add to their job applications';
COMMENT ON TABLE application_answers IS 'Applicant responses to custom questions';

COMMENT ON COLUMN applications.status IS 'Application status: pending, reviewed, shortlisted, rejected, hired';
COMMENT ON COLUMN applications.employer_notes IS 'Private notes from employer about the application';
COMMENT ON COLUMN listings.use_builtin_application IS 'Whether to use TomaShops application system vs external URL';
COMMENT ON COLUMN listings.auto_reply_message IS 'Automatic message sent to applicants upon submission';

-- Application system is ready! 