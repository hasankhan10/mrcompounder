-- Create custom ENUM types for status fields to ensure data consistency.
CREATE TYPE public.queue_status AS ENUM (
    'active',
    'paused',
    'ended'
);

CREATE TYPE public.token_status AS ENUM (
    'waiting',
    'called',
    'served',
    'no_show'
);

CREATE TYPE public.transaction_type AS ENUM (
    'topup',
    'usage'
);

CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'compounder'
);

-- Table for Clinics
-- This table holds all information about a specific clinic.
CREATE TABLE public.clinics (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    logo_url text,
    prepaid_balance integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    settings jsonb
);
COMMENT ON TABLE public.clinics IS 'Stores clinic-specific information and configuration.';

-- Table for Profiles
-- This table links Supabase auth users to a clinic and a role.
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL,
    role public.user_role NOT NULL,
    full_name text
);
COMMENT ON TABLE public.profiles IS 'Stores user profile information and links them to a clinic and role.';

-- Table for Queues (Doctor Sessions)
-- Each record represents a single doctor's session for a day.
CREATE TABLE public.queues (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    doctor_name text,
    session_date date NOT NULL DEFAULT CURRENT_DATE,
    status public.queue_status NOT NULL DEFAULT 'active',
    ended_at timestamp with time zone
);
COMMENT ON TABLE public.queues IS 'Represents a single doctor session for a specific clinic.';

-- Table for Tokens
-- Each record is a patient's token within a specific queue.
CREATE TABLE public.tokens (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    queue_id uuid NOT NULL REFERENCES public.queues(id) ON DELETE CASCADE,
    phone text NOT NULL,
    patient_name text,
    gender text, -- Added gender
    age integer, -- Added age
    purpose text, -- Added purpose
    is_emergency boolean NOT NULL DEFAULT false, -- Added is_emergency
    token_number serial NOT NULL, -- Auto-incrementing for each queue
    status public.token_status NOT NULL DEFAULT 'waiting',
    called_at timestamp with time zone,
    served_at timestamp with time zone
);
COMMENT ON TABLE public.tokens IS 'Represents a patient''s token in a queue.';

-- Create a sequence for token_number per queue
-- Note: A more robust solution for per-queue sequence would use a trigger.
-- For simplicity in this schema, we rely on application logic to determine the next token_number.
-- A simple `serial` is a good starting point.

-- Table for Transactions
-- Records all billing-related events (top-ups and usage).
CREATE TABLE public.transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    token_id uuid REFERENCES public.tokens(id) ON DELETE SET NULL, -- Link usage to a specific token
    type public.transaction_type NOT NULL,
    amount integer NOT NULL,
    balance_before integer NOT NULL,
    balance_after integer NOT NULL,
    metadata jsonb
);
COMMENT ON TABLE public.transactions IS 'Logs all prepaid balance changes for auditing.';

-- Table for Notification Subscriptions
-- Stores FCM tokens for sending web push notifications.
CREATE TABLE public.notification_subscriptions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    token_id uuid NOT NULL REFERENCES public.tokens(id) ON DELETE CASCADE,
    fcm_token text NOT NULL,
    UNIQUE (token_id, fcm_token) -- Prevent duplicate entries
);
COMMENT ON TABLE public.notification_subscriptions IS 'Stores push notification subscription details for patients.';
