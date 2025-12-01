-- Migration: Switch from Prepaid to Postpaid Model

-- 1. Add current_due column (Default 0)
ALTER TABLE clinics ADD COLUMN current_due INTEGER DEFAULT 0;

-- 2. Drop prepaid_balance column
ALTER TABLE clinics DROP COLUMN prepaid_balance;

-- 3. Update RLS policies (if any relied on prepaid_balance, though usually they don't)
-- (No specific RLS changes needed for standard CRUD, but good to be aware)
