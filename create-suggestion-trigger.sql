-- Create a function to handle the trigger
CREATE OR REPLACE FUNCTION handle_new_suggestion()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the edge function when a new suggestion is inserted
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

-- Create the trigger
CREATE TRIGGER trigger_new_suggestion
  AFTER INSERT ON suggestions
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_suggestion();

-- Enable the http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http; 