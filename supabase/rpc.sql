-- supabase/rpc.sql

----------------------------------------------------------------
-- Function: handle_served_token
-- Purpose: Atomically decrements a clinic's balance when a token is served.
--
-- Guards:
-- 1. Checks for sufficient balance.
-- 2. Prevents double-billing for the same token.
----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_served_token(token_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- To run with elevated privileges
AS $$
DECLARE
  target_clinic_id uuid;
  current_balance integer;
  transaction_exists integer;
BEGIN
  -- 1. Get the clinic_id for the token
  SELECT clinic_id INTO target_clinic_id FROM public.tokens WHERE id = token_id_param;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Token with ID % not found', token_id_param;
  END IF;

  -- 2. Prevent double-billing
  SELECT count(*) INTO transaction_exists FROM public.transactions WHERE token_id = token_id_param AND type = 'usage';
  IF transaction_exists > 0 THEN
    RAISE NOTICE 'Token % has already been billed.', token_id_param;
    RETURN; -- Exit gracefully
  END IF;

  -- 3. Get current balance and lock the row for update
  SELECT prepaid_balance INTO current_balance FROM public.clinics WHERE id = target_clinic_id FOR UPDATE;

  -- 4. Check for sufficient balance
  IF current_balance < 1 THEN
    RAISE EXCEPTION 'Insufficient balance for clinic %', target_clinic_id;
  END IF;

  -- 5. Decrement the clinic's balance
  UPDATE public.clinics
  SET prepaid_balance = prepaid_balance - 1
  WHERE id = target_clinic_id;

  -- 6. Record the 'usage' transaction
  INSERT INTO public.transactions(clinic_id, token_id, type, amount, balance_before, balance_after)
  VALUES (target_clinic_id, token_id_param, 'usage', -1, current_balance, current_balance - 1);
  
END;
$$;


----------------------------------------------------------------
-- Function: topup_clinic_balance
-- Purpose: Atomically increments a clinic's balance.
----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.topup_clinic_balance(clinic_id_param uuid, amount_param integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance integer;
BEGIN
  -- 1. Get current balance and lock the row for update
  SELECT prepaid_balance INTO current_balance FROM public.clinics WHERE id = clinic_id_param FOR UPDATE;

  -- 2. Increment the clinic's balance
  UPDATE public.clinics
  SET prepaid_balance = prepaid_balance + amount_param
  WHERE id = clinic_id_param;

  -- 3. Record the 'topup' transaction
  INSERT INTO public.transactions(clinic_id, type, amount, balance_before, balance_after)
  VALUES (clinic_id_param, 'topup', amount_param, current_balance, current_balance + amount_param);

END;
$$;
