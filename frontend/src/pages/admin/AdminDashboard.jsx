import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import {
  HiOutlineUserGroup, HiOutlineShieldCheck, HiOutlineClock,
  HiOutlineCalendar, HiOutlineDocumentText, HiOutlineArrowRight,
  HiOutlineExclamation
} from 'react-icons/hi';
import { FaUserMd, FaHeartbeat } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, docRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getDoctors({ status: 'PENDING', limit: 5 }),
        ]);
        setStats(statsRes.data);
        setPendingDoctors(docRes.data?.doctors || []);
      } catch (err) {
        console.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading admin control center...</p>
      </div>
    );
  }

  const priorityBreakdown = stats?.priorityBreakdown || { LOW: 0, MEDIUM: 0, HIGH: 0, VERY_HIGH: 0 };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Admin Control Center</h1>
          <p>System metrics, doctor verification queues, and patient oversight</p>
        </div>
      </div>

      {/* Pending Verifications Callout Banner if any */}
      {stats?.pendingDoctors > 0 && (
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          border: '1px solid #fde68a',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
            <div>
              <h4 style={{ margin: 0, color: '#92400e', fontSize: '1rem' }}>
                {stats.pendingDoctors} Doctor Registration(s) Pending Credential Verification
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#b45309' }}>
                Review submitted medical license documents and qualifications before activating profiles.
              </p>
            </div>
          </div>
          <button className="btn btn-warning btn-sm" onClick={() => navigate('/admin/doctors')}>
            Review Verification Queue <HiOutlineArrowRight />
          </button>
        </div>
      )}

      {/* Core KPI Grid */}
      <div className="grid-4 mb-3">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
            <HiOutlineUserGroup size={24} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">Total Patients</p>
            <p className="stat-card-value">{stats?.totalPatients || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--success-light)', color: 'var(--success-dark)' }}>
            <HiOutlineShieldCheck size={24} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">Approved Doctors</p>
            <p className="stat-card-value">{stats?.approvedDoctors || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning-dark)' }}>
            <HiOutlineClock size={24} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">Pending Verification</p>
            <p className="stat-card-value" style={{ color: 'var(--warning-dark)' }}>
              {stats?.pendingDoctors || 0}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--info-light)', color: 'var(--info-dark)' }}>
            <HiOutlineCalendar size={24} />
          </div>
          <div className="stat-card-content">
            <p className="stat-card-label">Today's Appointments</p>
            <p className="stat-card-value">{stats?.todayAppointments || 0}</p>
          </div>
        </div>
      </div>

      {/* Priority Distribution Overview */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Priority Triage Distribution</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/analytics')}>
            Full Analytics
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'center' }}>
          <div style={{ padding: '16px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', borderTop: '4px solid #ef4444' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>{priorityBreakdown.VERY_HIGH}</div>
            <div className="text-xs font-semibold text-muted" style={{ marginTop: 4 }}>VERY HIGH PRIORITY</div>
          </div>
          <div style={{ padding: '16px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', borderTop: '4px solid #f97316' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f97316' }}>{priorityBreakdown.HIGH}</div>
            <div className="text-xs font-semibold text-muted" style={{ marginTop: 4 }}>HIGH PRIORITY</div>
          </div>
          <div style={{ padding: '16px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', borderTop: '4px solid #eab308' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#eab308' }}>{priorityBreakdown.MEDIUM}</div>
            <div className="text-xs font-semibold text-muted" style={{ marginTop: 4 }}>MEDIUM PRIORITY</div>
          </div>
          <div style={{ padding: '16px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', borderTop: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>{priorityBreakdown.LOW}</div>
            <div className="text-xs font-semibold text-muted" style={{ marginTop: 4 }}>LOW PRIORITY</div>
          </div>
        </div>
      </div>

      {/* Pending Doctors Verification Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pending Doctor Verification Requests</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/doctors')}>
            View All ({stats?.pendingDoctors || 0})
          </button>
        </div>

        {pendingDoctors.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 16px' }}>
            <div className="empty-state-icon">✅</div>
            <p className="empty-state-title">Verification Queue Clear</p>
            <p className="empty-state-text">All doctor registrations have been audited and resolved.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Specialization</th>
                  <th>Qualification</th>
                  <th>Medical Reg. No.</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingDoctors.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div className="font-semibold">{doc.fullName}</div>
                      <div className="text-xs text-muted">{doc.userId?.email}</div>
                    </td>
                    <td>{doc.specialization || 'General'}</td>
                    <td>{doc.qualification}</td>
                    <td className="font-mono text-xs">{doc.medicalRegistrationNumber}</td>
                    <td><span className="badge badge-warning">Pending Review</span></td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/admin/doctors')}
                      >
                        Inspect & Verify
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

export default AdminDashboard;
