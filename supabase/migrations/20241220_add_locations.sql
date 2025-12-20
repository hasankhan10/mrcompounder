-- Create the new table for clinic locations
create table public.clinic_locations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  name text not null,
  is_active boolean default true
);

-- Enable RLS
alter table public.clinic_locations enable row level security;

-- Policies
create policy "Locations are visible to authenticated users"
  on public.clinic_locations for select
  to authenticated
  using (true);

create policy "Clinic admins can manage their locations"
  on public.clinic_locations for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.clinic_id = clinic_locations.clinic_id
      and profiles.role = 'compounder'
    )
  );

-- Add location support to tokens table
-- We store the location NAME directly to avoid complexity/joins if a location is deleted later,
-- OR we can store the ID. Storing the ID is better for renaming, but storing the Name is safer for history logs.
-- Let's store the ID and also the name snapshot if needed, but for now ID is fine.
-- Wait, the user prompt said "Dr Will see the every location and how many Patient is booked".
-- Let's add 'location_id' and 'location_name'.
alter table public.tokens 
add column location_id uuid references public.clinic_locations(id),
add column location_name text;

-- Add indexes for performance
create index idx_clinic_locations_clinic_id on public.clinic_locations(clinic_id);
create index idx_tokens_location_id on public.tokens(location_id);
