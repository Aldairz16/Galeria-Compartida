-- Add album_date column to albums
alter table public.albums add column if not exists album_date date;

-- Allow updating album_date in RLS
-- (Existing update policy covers all columns for owner)
