import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentApi from '../../services/appointmentApi';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineVideoCamera, HiOutlineCheckCircle, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.getAppointments({ status: filter === 'ALL' ? undefined : filter });
      setAppointments(res.data || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Doctor Appointments Management</h1>
          <p>Review scheduled patient consultations and manage clinic time slots</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-3" style={{ flexWrap: 'wrap' }}>
        {['ALL', 'CONFIRMED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All Appointments' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p className="empty-state-title">No Appointments</p>
            <p className="empty-state-text">No patient visits found matching the selected filter.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {appointments.map((apt) => (
            <div
              key={apt._id}
              className="card"
              style={{
                margin: 0,
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div className="avatar avatar-lg" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', fontSize: '1.25rem' }}>
                  {apt.patientId?.fullName?.[0] || 'P'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{apt.patientId?.fullName}</h3>
                    <span className={`badge ${
                      apt.status === 'CONFIRMED' ? 'badge-info' :
                      apt.status === 'WAITING' ? 'badge-warning' :
                      apt.status === 'IN_CONSULTATION' ? 'badge-success' :
                      apt.status === 'COMPLETED' ? 'badge-neutral' : 'badge-danger'
                    }`}>
                      {apt.status}
                    </span>
                    <span className={`badge ${
                      apt.priorityLevel === 'VERY_HIGH' ? 'badge-danger' :
                      apt.priorityLevel === 'HIGH' ? 'badge-warning' : 'badge-neutral'
                    }`}>
                      {apt.priorityLevel} Priority ({apt.priorityScore})
                    </span>
                  </div>

                  <div className="text-xs text-muted" style={{ marginBottom: 4 }}>
                    {apt.patientId?.gender || 'Patient'} • Phone: {apt.patientId?.phone || 'N/A'}
                  </div>

                  <div style={{ display: 'flex', gap: '14px', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    <span>📅 {new Date(apt.appointmentDate).toLocaleDateString()}</span>
                    <span>⏰ {apt.startTime}</span>
                  </div>

                  {apt.healthConcernId && (
                    <div className="text-xs text-secondary" style={{ marginTop: 4 }}>
                      <strong>Concern:</strong> {apt.healthConcernId.mainConcern}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {['CONFIRMED', 'WAITING', 'IN_CONSULTATION'].includes(apt.status) && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/doctor/consultation/${apt._id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <HiOutlineVideoCamera size={14} /> Start Consultation
                  </button>
                )}
                {apt.status === 'REQUESTED' && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleUpdateStatus(apt._id, 'CONFIRMED')}
                  >
                    Confirm
                  </button>
                )}
                {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => handleUpdateStatus(apt._id, 'CANCELLED')}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
