-- Create the 'payment-proofs' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on objects if not already enabled (usually is by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users (clinics) to upload files
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

-- Policy 2: Allow public read access (so Admin can view the image via URL)
CREATE POLICY "Public read access for payment proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');
