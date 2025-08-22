-- Add 'video' column for backward/forward compatibility with existing code paths
-- Run this in your Supabase SQL Editor if needed

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS video TEXT;

-- Backfill from video_url where possible so readers of either column work
UPDATE public.listings
SET video = COALESCE(video, video_url)
WHERE video IS NULL;

COMMENT ON COLUMN public.listings.video IS 'Primary video URL for the listing (compat with video_url).';

-- Optional: if you want to keep columns in sync going forward, you could add a trigger.
-- This repo currently reads either video_url or video.

-- Ask PostgREST (Supabase REST) to reload its schema cache immediately
select pg_notify('pgrst', 'reload schema'); 