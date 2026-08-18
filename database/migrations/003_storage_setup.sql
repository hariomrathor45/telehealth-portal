-- ============================================================
-- SMART PRIORITY-BASED TELEHEALTH PORTAL SYSTEM
-- Migration 003: Storage Buckets & Policies
-- ============================================================

-- Create storage bucket for doctor verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'doctor-documents',
    'doctor-documents',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos',
    'profile-photos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- Doctor documents: Only the doctor can upload their own documents
CREATE POLICY "Doctors can upload own documents" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'doctor-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Doctor documents: Doctor can view their own documents
CREATE POLICY "Doctors can view own documents" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'doctor-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Doctor documents: Admins can view all documents
CREATE POLICY "Admins can view all doctor documents" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'doctor-documents'
        AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Profile photos: Authenticated users can upload their own
CREATE POLICY "Users can upload own profile photo" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'profile-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Profile photos: Public read
CREATE POLICY "Anyone can view profile photos" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'profile-photos');
