-- Enable RLS on albums if not already (it is, but good to ensure)
alter table public.albums enable row level security;

-- Policy for INSERT (Owners)
create policy "Users can insert their own albums" on public.albums
  for insert with check (auth.uid() = user_id);

-- Policy for UPDATE (Owners)
create policy "Users can update their own albums" on public.albums
  for update using (auth.uid() = user_id);

-- Policy for DELETE (Owners)
create policy "Users can delete their own albums" on public.albums
  for delete using (auth.uid() = user_id);
