import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import doctorApi from '../../services/doctorApi';
import {
  HiOutlineCalendar, HiOutlineClock, HiOutlineCheck,
  HiOutlineUserGroup, HiOutlineExclamation, HiOutlineArrowRight,
  HiOutlineVideoCamera
} from 'react-icons/hi';
import { FaUserMd, FaHeartbeat } from 'react-icons/fa';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await doctorApi.getMyDashboard();
        setData(res.data);
      } catch (err) {
        console.warn('Doctor dashboard fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const profile = data?.profile || {};
  const stats = data?.stats || {};
  const queue = data?.recentQueue || [];
  const doctorName = profile.fullName || user?.email?.split('@')[0] || 'Doctor';
  const isApproved = profile.verificationStatus === 'APPROVED';

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Welcome, Dr. {doctorName}! 🩺</h1>
          <p>
            {profile.specialization || 'Specialist'} • {profile.qualification || 'MBBS'} • {profile.hospitalClinic || 'TeleHealth Network'}
          </p>
        </div>
        <span
          className={`badge ${
            isApproved ? 'badge-success' : profile.verificationStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'
          }`}
          style={{ fontSize: '0.85rem', padding: '6px 14px' }}
        >
          {isApproved ? '✅ Verified & Active' : profile.verificationStatus === 'REJECTED' ? '❌ Verification Rejected' : '⏳ Pending Admin Verification'}
        </span>
      </div>

      {/* PENDING Verification Banner */}
      {!isApproved && profile.verificationStatus === 'PENDING' && (
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          border: '1px solid #fde68a',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '2rem' }}>⏳</span>
          <div>
            <h3 style={{ margin: '0 0 4px', color: '#92400e', fontSize: '1.05rem' }}>
              Credential Verification in Progress
            </h3>
            <p className="text-sm" style={{ color: '#b45309', lineHeight: 1.6, margin: 0 }}>
              Your medical registration number (<strong>{profile.medicalRegistrationNumber}</strong>) and submitted certificates are under review by the portal administration. You will be able to start consultations and accept patients once approved.
            </p>
          </div>
        </div>
      )}

      {/* REJECTED Banner */}
      {profile.verificationStatus === 'REJECTED' && (
        <div style={{
          padding: '20px 24px',
          background: 'var(--danger-light)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '2rem' }}>❌</span>
          <div>
            <h3 style={{ margin: '0 0 4px', color: 'var(--danger-dark)', fontSize: '1.05rem' }}>
              Verification Not Approved
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
              Reason: <em>{profile.verificationRemarks || 'Documents require resubmission.'}</em> Please contact support.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid-4 mb-3">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
            <HiOutlineCalendar size={22} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">Today's Visits</p>
            <p className="stat-card-value">{stats.todayAppointments || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning-dark)' }}>
            <HiOutlineClock size={22} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">Waiting in Queue</p>
            <p className="stat-card-value" style={{ color: 'var(--warning-dark)' }}>{stats.waitingPatients || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <HiOutlineExclamation size={22} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">High-Priority Cases</p>
            <p className="stat-card-value" style={{ color: 'var(--danger)' }}>{stats.highPriorityCount || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--success-light)', color: 'var(--success-dark)' }}>
            <HiOutlineCheck size={22} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">Completed Today</p>
            <p className="stat-card-value">{stats.completedToday || 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Clinical Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/doctor/queue')} disabled={!isApproved}>
            📋 Open Priority Queue ({stats.waitingPatients || 0})
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/doctor/appointments')} disabled={!isApproved}>
            📅 Schedule & Appointments
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/doctor/availability')}>
            ⏰ Manage Working Slots
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/doctor/patients')} disabled={!isApproved}>
            👥 Patient Directory
          </button>
        </div>
      </div>

      {/* Priority Queue Live Preview */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Top Urgent Waiting Patients</h3>
            <p className="text-xs text-muted" style={{ margin: 0 }}>Ordered by calculated priority urgency score & queue arrival</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/doctor/queue')} disabled={!isApproved}>
            View Full Queue
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 16px' }}>
            <div className="empty-state-icon">✅</div>
            <p className="empty-state-title">No Waiting Patients</p>
            <p className="empty-state-text">Your priority queue is clear right now.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Urgency Level</th>
                  <th>Score</th>
                  <th>Reported Concern</th>
                  <th>Appointment Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((apt) => (
                  <tr key={apt._id}>
                    <td>
                      <div className="font-semibold">{apt.patientId?.fullName}</div>
                      <div className="text-xs text-muted">{apt.patientId?.gender || 'Patient'} • {apt.patientId?.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        apt.priorityLevel === 'VERY_HIGH' ? 'badge-danger' :
                        apt.priorityLevel === 'HIGH' ? 'badge-warning' :
                        apt.priorityLevel === 'MEDIUM' ? 'badge-info' : 'badge-neutral'
                      }`}>
                        {apt.priorityLevel}
                      </span>
                    </td>
                    <td className="font-bold text-sm" style={{ color: 'var(--primary-700)' }}>
                      {apt.priorityScore}/100
                    </td>
                    <td style={{ maxWidth: '260px' }}>
                      <div className="text-xs text-secondary" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {apt.healthConcernId?.mainConcern || 'General consultation request'}
                      </div>
                    </td>
                    <td className="text-xs font-mono">{apt.startTime}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/doctor/consultation/${apt._id}`)}
                        disabled={!isApproved}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <HiOutlineVideoCamera size={14} /> Start
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
