-- Add location column to clinics table
ALTER TABLE public.clinics 
ADD COLUMN location TEXT;

-- Optional: Set a default value for existing rows if needed, or leave null
-- UPDATE public.clinics SET location = 'Unknown' WHERE location IS NULL;
