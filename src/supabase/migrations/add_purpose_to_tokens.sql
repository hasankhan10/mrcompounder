-- Migration: Add purpose column to tokens table

ALTER TABLE tokens ADD COLUMN purpose TEXT;
