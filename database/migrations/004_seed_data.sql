-- ============================================================
-- SMART PRIORITY-BASED TELEHEALTH PORTAL SYSTEM
-- Migration 004: Seed Data
-- ============================================================

-- ============================================================
-- 1. SPECIALIZATIONS (pre-seed)
-- ============================================================

INSERT INTO specializations (name, description) VALUES
    ('General Medicine', 'General medical consultation and primary care'),
    ('Cardiology', 'Heart and cardiovascular system specialist'),
    ('Dermatology', 'Skin, hair, and nail conditions'),
    ('Orthopedics', 'Bones, joints, muscles, and ligaments'),
    ('Pediatrics', 'Medical care for infants, children, and adolescents'),
    ('Neurology', 'Brain, spinal cord, and nervous system disorders'),
    ('Psychiatry', 'Mental health and behavioral disorders'),
    ('Ophthalmology', 'Eye care and vision disorders'),
    ('ENT', 'Ear, nose, and throat conditions'),
    ('Gynecology', 'Reproductive health for women'),
    ('Urology', 'Urinary tract and male reproductive health'),
    ('Gastroenterology', 'Digestive system and related disorders'),
    ('Pulmonology', 'Lung and respiratory system disorders'),
    ('Endocrinology', 'Hormonal and metabolic disorders'),
    ('Oncology', 'Cancer diagnosis and treatment planning');

-- ============================================================
-- NOTE: Admin account should be created via the backend
-- setup endpoint or directly in Supabase Auth dashboard.
-- Do NOT create admin accounts through public registration.
--
-- After creating an admin user in Supabase Auth, update:
-- UPDATE users SET role = 'ADMIN' WHERE email = 'admin@telehealth.com';
-- ============================================================
