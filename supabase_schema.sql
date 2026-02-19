-- Create albums table
create table public.albums (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  title text not null,
  cover_url text not null,
  external_link text,
  constraint albums_pkey primary key (id)
);

-- Enable RLS
alter table public.albums enable row level security;

-- Policies for albums (Public access for simplicity in this MVP)
create policy "Enable read access for all users" on public.albums for select using (true);
create policy "Enable insert access for all users" on public.albums for insert with check (true);

-- Create storage bucket for covers
insert into storage.buckets (id, name, public) values ('covers', 'covers', true);

-- Storage policies
create policy "Give public access to covers" on storage.objects for select using (bucket_id = 'covers');
create policy "Enable upload access to covers" on storage.objects for insert with check (bucket_id = 'covers');
