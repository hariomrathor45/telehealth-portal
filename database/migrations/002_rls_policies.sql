-- ============================================================
-- SMART PRIORITY-BASED TELEHEALTH PORTAL SYSTEM
-- Migration 002: Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS POLICIES
-- ============================================================

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- ============================================================
-- PATIENTS POLICIES
-- ============================================================

-- Patients can view and update their own profile
CREATE POLICY "Patients can view own profile" ON patients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Patients can update own profile" ON patients
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Patients can insert own profile" ON patients
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all patients
CREATE POLICY "Admins can view all patients" ON patients
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Doctors can view patients they have appointments with
CREATE POLICY "Doctors can view assigned patients" ON patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            WHERE d.user_id = auth.uid() AND a.patient_id = patients.id
        )
    );

-- ============================================================
-- DOCTORS POLICIES
-- ============================================================

-- Doctors can view and update their own profile
CREATE POLICY "Doctors can view own profile" ON doctors
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Doctors can update own profile" ON doctors
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Doctors can insert own profile" ON doctors
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Patients can view approved doctors only
CREATE POLICY "Patients can view approved doctors" ON doctors
    FOR SELECT USING (
        verification_status = 'APPROVED' AND account_status = 'ACTIVE'
    );

-- Admins can view all doctors
CREATE POLICY "Admins can view all doctors" ON doctors
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Admins can update doctors
CREATE POLICY "Admins can update doctors" ON doctors
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- ============================================================
-- SPECIALIZATIONS POLICIES (public read)
-- ============================================================

CREATE POLICY "Anyone can view specializations" ON specializations
    FOR SELECT USING (true);

-- ============================================================
-- DOCTOR VERIFICATIONS POLICIES
-- ============================================================

CREATE POLICY "Doctors can view own verification" ON doctor_verifications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM doctors WHERE doctors.id = doctor_verifications.doctor_id AND doctors.user_id = auth.uid())
    );

CREATE POLICY "Admins can manage verifications" ON doctor_verifications
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- ============================================================
-- DOCTOR AVAILABILITY POLICIES
-- ============================================================

CREATE POLICY "Doctors can manage own availability" ON doctor_availability
    FOR ALL USING (
        EXISTS (SELECT 1 FROM doctors WHERE doctors.id = doctor_availability.doctor_id AND doctors.user_id = auth.uid())
    );

-- Patients can view availability of approved doctors
CREATE POLICY "Patients can view doctor availability" ON doctor_availability
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM doctors
            WHERE doctors.id = doctor_availability.doctor_id
            AND doctors.verification_status = 'APPROVED'
            AND doctors.account_status = 'ACTIVE'
        )
    );

-- ============================================================
-- HEALTH CONCERNS POLICIES
-- ============================================================

CREATE POLICY "Patients can manage own health concerns" ON health_concerns
    FOR ALL USING (
        EXISTS (SELECT 1 FROM patients WHERE patients.id = health_concerns.patient_id AND patients.user_id = auth.uid())
    );

-- Doctors can view health concerns for their appointments
CREATE POLICY "Doctors can view assigned health concerns" ON health_concerns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN doctors d ON d.id = a.doctor_id
            WHERE d.user_id = auth.uid() AND a.health_concern_id = health_concerns.id
        )
    );

-- ============================================================
-- PRIORITY ASSESSMENTS POLICIES
-- ============================================================

CREATE POLICY "Patients can view own assessments" ON priority_assessments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM patients WHERE patients.id = priority_assessments.patient_id AND patients.user_id = auth.uid())
    );

CREATE POLICY "Admins can view all assessments" ON priority_assessments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- ============================================================
-- APPOINTMENTS POLICIES
-- ============================================================

CREATE POLICY "Patients can manage own appointments" ON appointments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM patients WHERE patients.id = appointments.patient_id AND patients.user_id = auth.uid())
    );

CREATE POLICY "Doctors can view their appointments" ON appointments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid())
    );

CREATE POLICY "Doctors can update their appointments" ON appointments
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid())
    );

CREATE POLICY "Admins can view all appointments" ON appointments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- ============================================================
-- CONSULTATIONS POLICIES
-- ============================================================

CREATE POLICY "Patients can view own consultations" ON consultations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM patients WHERE patients.id = consultations.patient_id AND patients.user_id = auth.uid())
    );

CREATE POLICY "Doctors can manage their consultations" ON consultations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM doctors WHERE doctors.id = consultations.doctor_id AND doctors.user_id = auth.uid())
    );

-- ============================================================
-- MEDICAL RECORDS POLICIES
-- ============================================================

CREATE POLICY "Patients can view own records" ON medical_records
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM patients WHERE patients.id = medical_records.patient_id AND patients.user_id = auth.uid())
    );

CREATE POLICY "Doctors can view/create records for their patients" ON medical_records
    FOR ALL USING (
        EXISTS (SELECT 1 FROM doctors WHERE doctors.id = medical_records.doctor_id AND doctors.user_id = auth.uid())
    );

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- ADMIN ACTIONS POLICIES
-- ============================================================

CREATE POLICY "Admins can manage audit logs" ON admin_actions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
    );
