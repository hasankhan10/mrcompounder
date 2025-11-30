-- Create table for payment requests
CREATE TABLE IF NOT EXISTS public.payment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    transaction_id TEXT,
    screenshot_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Clinics can insert their own requests
CREATE POLICY "Clinics can insert own requests"
ON public.payment_requests FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE clinic_id = payment_requests.clinic_id 
        AND role = 'compounder'
    )
);

-- 2. Clinics can view their own requests
CREATE POLICY "Clinics can view own requests"
ON public.payment_requests FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE clinic_id = payment_requests.clinic_id
    )
);

-- 3. Admins can view all requests
CREATE POLICY "Admins can view all requests"
ON public.payment_requests FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- 4. Admins can update requests (approve/reject)
CREATE POLICY "Admins can update requests"
ON public.payment_requests FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);
