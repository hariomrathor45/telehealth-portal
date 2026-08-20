import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { Toaster } from 'react-hot-toast';

// Public & Auth Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import PatientRegisterPage from './pages/auth/PatientRegisterPage';
import DoctorRegisterPage from './pages/auth/DoctorRegisterPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import SmartConsultation from './pages/patient/SmartConsultation';
import FindDoctors from './pages/patient/FindDoctors';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientProfile from './pages/patient/PatientProfile';
import PatientNotifications from './pages/patient/PatientNotifications';
import VideoConsultationRoom from './components/consultation/VideoConsultationRoom';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPriorityQueue from './pages/doctor/DoctorPriorityQueue';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import ActiveConsultation from './pages/doctor/ActiveConsultation';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorNotifications from './pages/doctor/DoctorNotifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorVerification from './pages/admin/DoctorVerification';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPatients from './pages/admin/AdminPatients';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

import './styles/index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#fff',
            fontSize: '0.875rem',
            borderRadius: '8px',
          },
        }}
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/patient" element={<PatientRegisterPage />} />
          <Route path="/register/doctor" element={<DoctorRegisterPage />} />

          {/* Patient Protected Routes */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="smart-consultation" element={<SmartConsultation />} />
            <Route path="doctors" element={<FindDoctors />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="records" element={<PatientMedicalRecords />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="notifications" element={<PatientNotifications />} />
            <Route path="consultation-room/:id" element={<VideoConsultationRoom />} />
          </Route>

          {/* Doctor Protected Routes */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="queue" element={<DoctorPriorityQueue />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="consultation/:id" element={<ActiveConsultation />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="records" element={<DoctorMedicalRecords />} />
            <Route path="availability" element={<DoctorAvailability />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="notifications" element={<DoctorNotifications />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="doctors" element={<DoctorVerification />} />
            <Route path="all-doctors" element={<AdminDoctors />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<Navigate to="/admin/settings" replace />} />
            <Route path="notifications" element={<Navigate to="/admin/audit-logs" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
