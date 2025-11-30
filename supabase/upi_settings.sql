-- Create table for global system settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default values
INSERT INTO public.system_settings (key, value) VALUES 
('upi_id', 'admin@upi'),
('qr_code_url', '')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Everyone (including anon) can read settings (needed for Recharge Modal)
CREATE POLICY "Public read access for system settings"
ON public.system_settings FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Only Super Admin can update
-- Note: We need to ensure get_my_role() exists and works. 
-- If not, we can use a simpler check or rely on the API to enforce admin check.
-- Assuming get_my_role() is available from previous setup.
CREATE POLICY "Super Admin update access"
ON public.system_settings FOR UPDATE
USING (public.get_my_role() = 'super_admin');

CREATE POLICY "Super Admin insert access"
ON public.system_settings FOR INSERT
WITH CHECK (public.get_my_role() = 'super_admin');
