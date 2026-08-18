import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import patientApi from '../../services/patientApi';
import {
  HiOutlineCalendar, HiOutlineDocumentText, HiOutlineSearch,
  HiOutlineSparkles, HiOutlineClock, HiOutlineUserGroup,
  HiOutlineArrowRight, HiOutlineShieldCheck
} from 'react-icons/hi';
import { FaUserMd, FaHeartbeat } from 'react-icons/fa';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await patientApi.getDashboard();
        setData(res.data);
      } catch (err) {
        console.warn('Dashboard fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const patientName = data?.profile?.fullName || user?.email?.split('@')[0] || 'Patient';
  const upcoming = data?.upcomingAppointments || [];
  const activeWaiting = data?.activeWaitingAppointment;
  const doctors = data?.recommendedDoctors || [];
  const records = data?.recentRecords || [];

  return (
    <div className="animate-fadeIn">
      {/* Welcome Banner */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-header-left">
          <h1>Welcome back, {patientName}! 👋</h1>
          <p>Your centralized health summary and smart consultation portal</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/patient/smart-consultation')}>
          <HiOutlineSparkles size={16} /> Start Smart Triage
        </button>
      </div>

      {/* Active Priority Queue Banner if patient is waiting in queue */}
      {activeWaiting && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: '#fff',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '24px',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className={`badge ${
                activeWaiting.priorityLevel === 'VERY_HIGH' ? 'badge-danger' :
                activeWaiting.priorityLevel === 'HIGH' ? 'badge-warning' :
                activeWaiting.priorityLevel === 'MEDIUM' ? 'badge-info' : 'badge-neutral'
              }`}>
                {activeWaiting.priorityLevel} PRIORITY ({activeWaiting.priorityScore}/100)
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Waiting in Doctor's Queue
              </span>
            </div>
            <h3 style={{ color: '#f8fafc', fontSize: '1.125rem', marginBottom: 2 }}>
              Consultation with Dr. {activeWaiting.doctorId?.fullName} ({activeWaiting.doctorId?.specialization || 'Specialist'})
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Concern: "{activeWaiting.healthConcernId?.mainConcern || 'Medical consultation'}"
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/patient/appointments')}
            style={{ padding: '10px 20px' }}
          >
            View Queue Status <HiOutlineArrowRight />
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid-4 mb-3">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
            <HiOutlineCalendar size={22} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">Upcoming Visits</p>
            <p className="stat-card-value">{data?.stats?.upcomingCount || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--info-light)', color: 'var(--info-dark)' }}>
            <HiOutlineSparkles size={22} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">Smart Consultations</p>
            <p className="stat-card-value">{data?.stats?.totalAppointments || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--success-light)', color: 'var(--success-dark)' }}>
            <HiOutlineDocumentText size={22} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">Medical Records</p>
            <p className="stat-card-value">{data?.stats?.totalRecords || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning-dark)' }}>
            <HiOutlineShieldCheck size={22} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">Verified Specialists</p>
            <p className="stat-card-value">{doctors.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/patient/smart-consultation')}>
            ✨ Smart Urgency Triage
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/patient/doctors')}>
            <FaUserMd /> Browse & Book Doctor
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/patient/appointments')}>
            <HiOutlineCalendar /> My Appointments
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/patient/records')}>
            <HiOutlineDocumentText /> Medical History
          </button>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Appointments & Recent Records */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Appointments</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/patient/appointments')}>
              View All
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 16px' }}>
              <div className="empty-state-icon">📅</div>
              <p className="empty-state-title">No Upcoming Appointments</p>
              <p className="empty-state-text">Book an appointment or submit a health concern for smart priority queueing.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/patient/doctors')} style={{ marginTop: '12px' }}>
                Find a Doctor
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcoming.map((apt) => (
                <div
                  key={apt._id}
                  style={{
                    padding: '14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="avatar" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                      {apt.doctorId?.fullName?.[0] || 'D'}
                    </div>
                    <div>
                      <div className="font-semibold">{apt.doctorId?.fullName}</div>
                      <div className="text-xs text-muted">{apt.doctorId?.specialization || 'General'}</div>
                      <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                        📅 {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.startTime}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-info">{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Medical Records */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Medical Summaries</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/patient/records')}>
              View All
            </button>
          </div>

          {records.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 16px' }}>
              <div className="empty-state-icon">📋</div>
              <p className="empty-state-title">No Medical Records Yet</p>
              <p className="empty-state-text">Completed doctor consultations will automatically appear here with full notes.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {records.map((rec) => (
                <div
                  key={rec._id}
                  style={{
                    padding: '14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="font-semibold text-sm">{rec.doctorId?.fullName}</span>
                    <span className="text-xs text-muted">{new Date(rec.recordDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-secondary" style={{ margin: 0 }}>
                    <strong>Observation:</strong> {rec.observations || rec.consultationSummary || 'Routine medical review'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Approved Doctors */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Available Verified Doctors</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/patient/doctors')}>
            Browse All Doctors
          </button>
        </div>

        {doctors.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 16px' }}>
            <div className="empty-state-icon">👨‍⚕️</div>
            <p className="empty-state-title">Doctors Being Verified</p>
            <p className="empty-state-text">Specialists will appear here once approved by portal administrators.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {doctors.map((doc) => (
              <div
                key={doc._id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div className="avatar" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                      {doc.fullName?.[0] || 'D'}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{doc.fullName}</div>
                      <div className="text-xs text-muted">{doc.qualification}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span className="badge badge-info">{doc.specialization || 'General'}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--primary-700)' }}>
                      ₹{doc.consultationFee || 'Free'}
                    </span>
                  </div>
                  <p className="text-xs text-muted" style={{ marginTop: '8px', marginBottom: 0 }}>
                    {doc.experienceYears} yrs exp • {doc.hospitalClinic || 'TeleHealth Specialist'}
                  </p>
                </div>
                <button
                  className="btn btn-primary btn-sm btn-block"
                  onClick={() => navigate(`/patient/doctors?book=${doc._id}`)}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
