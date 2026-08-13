-- Migration: Add price_per_patient to clinics table
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS price_per_patient NUMERIC(10, 2) NOT NULL DEFAULT 1.00;
