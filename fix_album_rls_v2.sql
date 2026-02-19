-- Drop existing policies to avoid conflicts and ensure clean state
drop policy if exists "Users can insert their own albums" on public.albums;
drop policy if exists "Users can update their own albums" on public.albums;
drop policy if exists "Users can delete their own albums" on public.albums;
-- policies might have different names in previous setup, let's try to cover bases or just rely on the standard ones we want to enforce.

-- Re-create Policies
create policy "Users can insert their own albums" on public.albums
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own albums" on public.albums
  for update using (auth.uid() = user_id);

create policy "Users can delete their own albums" on public.albums
  for delete using (auth.uid() = user_id);
