-- Migration: Add doctor_arrival_time to queues table

ALTER TABLE queues ADD COLUMN doctor_arrival_time TEXT;
