-- RLS (Row-Level Security) Policies for Clinic Line

-- First, enable RLS for all relevant tables.
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper functions to get user details from their JWT and profiles table.

-- Function to get the current user's role.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role AS $$
DECLARE
    user_role public.user_role;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the current user's clinic_id.
CREATE OR REPLACE FUNCTION public.get_my_clinic_id()
RETURNS uuid AS $$
DECLARE
    user_clinic_id uuid;
BEGIN
    SELECT clinic_id INTO user_clinic_id FROM public.profiles WHERE id = auth.uid();
    RETURN user_clinic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


--------------------------------
-- RLS Policies for `profiles`
--------------------------------
-- Users can see their own profile. Super admins can see all.
CREATE POLICY "Profiles are visible to owner and super admins"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.get_my_role() = 'super_admin');

-- Users can update their own profile. Super admins can update any.
CREATE POLICY "Profiles can be updated by owner and super admins"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.get_my_role() = 'super_admin');


--------------------------------
-- RLS Policies for `clinics`
--------------------------------
-- Compounders can see their own clinic. Super admins can see all.
CREATE POLICY "Clinics are visible to their compounders and super admins"
ON public.clinics FOR SELECT
USING (id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

-- Only super admins can create, update, or delete clinics.
CREATE POLICY "Clinics can be managed only by super admins"
ON public.clinics FOR ALL -- ALL covers INSERT, UPDATE, DELETE
USING (public.get_my_role() = 'super_admin')
WITH CHECK (public.get_my_role() = 'super_admin');


--------------------------------
-- RLS Policies for `queues`, `tokens`, `transactions`, `notification_subscriptions`
-- (These tables share the same policy structure)
--------------------------------

-- Generic policy for tables with a `clinic_id`
-- Applies to: queues, tokens, transactions, notification_subscriptions

-- SELECT: Compounders can view data for their clinic. Super admins can view all.
CREATE POLICY "Allow select for own clinic or super admin"
ON public.queues FOR SELECT
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow select for own clinic or super admin"
ON public.tokens FOR SELECT
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow select for own clinic or super admin"
ON public.transactions FOR SELECT
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow select for own clinic or super admin"
ON public.notification_subscriptions FOR SELECT
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

-- INSERT: Compounders can insert data for their clinic. Super admins can insert for any.
CREATE POLICY "Allow insert for own clinic or super admin"
ON public.queues FOR INSERT
WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow insert for own clinic or super admin"
ON public.tokens FOR INSERT
WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow insert for own clinic or super admin"
ON public.transactions FOR INSERT
WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow insert for own clinic or super admin"
ON public.notification_subscriptions FOR INSERT
WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');


-- UPDATE: Compounders can update data for their clinic. Super admins can update any.
CREATE POLICY "Allow update for own clinic or super admin"
ON public.queues FOR UPDATE
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow update for own clinic or super admin"
ON public.tokens FOR UPDATE
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow update for own clinic or super admin"
ON public.transactions FOR UPDATE
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow update for own clinic or super admin"
ON public.notification_subscriptions FOR UPDATE
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');


-- DELETE: Compounders can delete data for their clinic. Super admins can delete any.
CREATE POLICY "Allow delete for own clinic or super admin"
ON public.queues FOR DELETE
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow delete for own clinic or super admin"
ON public.tokens FOR DELETE
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow delete for own clinic or super admin"
ON public.transactions FOR DELETE
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');

CREATE POLICY "Allow delete for own clinic or super admin"
ON public.notification_subscriptions FOR DELETE
USING (clinic_id = public.get_my_clinic_id() OR public.get_my_role() = 'super_admin');
