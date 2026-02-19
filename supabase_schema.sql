-- Create galleries table
create table if not exists public.galleries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  title text not null,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on galleries
alter table public.galleries enable row level security;

-- Add gallery_id to albums (nullable for now to support old albums, but ideally we should migrate them)
alter table public.albums add column gallery_id uuid references public.galleries;

-- Update RLS for Galleries
create policy "Users can view their own galleries" on public.galleries
  for select using (auth.uid() = user_id);

create policy "Users can insert their own galleries" on public.galleries
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own galleries" on public.galleries
  for update using (auth.uid() = user_id);

create policy "Users can delete their own galleries" on public.galleries
  for delete using (auth.uid() = user_id);

-- Update RLS for Albums (allow viewing if gallery is public OR user owns it)
drop policy "Users can view their own albums" on public.albums;

create policy "Users can view own albums OR public gallery albums" on public.albums
  for select using (
    auth.uid() = user_id 
    OR 
    exists (
      select 1 from public.galleries 
      where galleries.id = albums.gallery_id 
      and galleries.is_public = true
    )
  );

-- Allow public access to read galleries if is_public = true
create policy "Public can view shared galleries" on public.galleries
  for select using (is_public = true);
