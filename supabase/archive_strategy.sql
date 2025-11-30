-- ==========================================
-- ARCHIVE STRATEGY FOR SCALABILITY
-- ==========================================

-- 1. Create the Archive Table
-- This table mirrors the structure of the 'tokens' table but is used for cold storage.
CREATE TABLE IF NOT EXISTS tokens_archive (
    LIKE tokens INCLUDING ALL
);

-- Remove constraints that might conflict (like foreign keys if we delete queues)
-- But for now, keeping them is fine if we don't delete queues.
-- Ideally, archive tables shouldn't enforce strict FKs if the parent might be deleted.
-- Let's drop the FK constraint on queue_id for the archive table to be safe.
ALTER TABLE tokens_archive DROP CONSTRAINT IF EXISTS tokens_queue_id_fkey;


-- 2. Create the Archiving Function
-- This function moves tokens older than 24 hours to the archive table.
CREATE OR REPLACE FUNCTION archive_old_tokens()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    moved_count INTEGER;
BEGIN
    -- Move tokens that are 'served', 'no_show', or just old (created > 24h ago)
    -- We keep 'waiting' and 'called' tokens if they are recent, but if they are > 24h old, they are likely stale.
    
    WITH moved_rows AS (
        DELETE FROM tokens
        WHERE created_at < NOW() - INTERVAL '24 hours'
        RETURNING *
    )
    INSERT INTO tokens_archive
    SELECT * FROM moved_rows;

    GET DIAGNOSTICS moved_count = ROW_COUNT;
    
    RETURN 'Archived ' || moved_count || ' tokens.';
END;
$$;

-- 3. Create Indexes for Performance (As discussed)
CREATE INDEX IF NOT EXISTS idx_tokens_phone ON tokens(phone);
CREATE INDEX IF NOT EXISTS idx_tokens_queue_status_created ON tokens(queue_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_queues_clinic_status ON queues(clinic_id, status);
