-- WARNING: This will delete existing albums to fix the security constraint!
truncate table public.albums;

-- Now we can add the column as NOT NULL
alter table public.albums add column user_id uuid references auth.users not null default auth.uid();

-- Enable RLS
alter table public.albums enable row level security;

-- Drop existing policies
drop policy if exists "Enable read access for all users" on public.albums;
drop policy if exists "Enable insert access for all users" on public.albums;

-- Create private policies
create policy "Users can view their own albums" on public.albums
  for select using (auth.uid() = user_id);

create policy "Users can create their own albums" on public.albums
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own albums" on public.albums
  for update using (auth.uid() = user_id);

create policy "Users can delete their own albums" on public.albums
  for delete using (auth.uid() = user_id);

-- Storage Policies
drop policy if exists "Enable upload access to covers" on storage.objects;

create policy "Authenticated users can upload covers" on storage.objects
  for insert with check (bucket_id = 'covers' and auth.role() = 'authenticated');

create policy "Users can delete their own covers" on storage.objects
  for delete using (bucket_id = 'covers' and auth.uid() = owner);
