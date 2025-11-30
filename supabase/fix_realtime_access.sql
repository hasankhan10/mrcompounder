-- Allow public (anonymous) access to Queues and Tokens for Realtime updates
-- This is necessary for the Patient View to receive live updates without being logged in.

-- 1. Allow Public to View Queues (Status, Doctor Name, etc.)
CREATE POLICY "Public can view queues"
ON public.queues FOR SELECT
TO anon
USING (true);

-- 2. Allow Public to View Tokens (To track their position)
-- Note: In a stricter system, you might want to hide patient names, 
-- but RLS applies to the whole row. Since we need to show "Now Serving Token #X", 
-- public access is required.
CREATE POLICY "Public can view tokens"
ON public.tokens FOR SELECT
TO anon
USING (true);

-- 3. Ensure Realtime is enabled for these tables (usually enabled by default on table creation, but good to double check in dashboard)
-- ALTER PUBLICATION supabase_realtime ADD TABLE queues;
-- ALTER PUBLICATION supabase_realtime ADD TABLE tokens;
