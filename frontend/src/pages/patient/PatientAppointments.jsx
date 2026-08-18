import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentApi from '../../services/appointmentApi';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineVideoCamera, HiOutlineX, HiOutlinePlus } from 'react-icons/hi';
import toast from 'react-hot-toast';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // Cancel Modal
  const [cancellingApt, setCancellingApt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

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

  const handleCancelAppointment = async () => {
    if (!cancellingApt) return;
    setCancelLoading(true);
    try {
      await appointmentApi.updateStatus(cancellingApt._id, 'CANCELLED', cancelReason);
      toast.success('Appointment cancelled successfully');
      setCancellingApt(null);
      setCancelReason('');
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(false);
    }
  };

  const getPriorityBadgeClass = (level) => {
    switch (level) {
      case 'VERY_HIGH': return 'badge-danger';
      case 'HIGH': return 'badge-warning';
      case 'MEDIUM': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'badge-info';
      case 'WAITING': return 'badge-warning';
      case 'IN_CONSULTATION': return 'badge-success';
      case 'COMPLETED': return 'badge-neutral';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Consultations & Appointments</h1>
          <p>Track your scheduled visits, live queue statuses, and consultation rooms</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/patient/doctors')}>
          <HiOutlinePlus size={16} /> Book New Appointment
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-3" style={{ flexWrap: 'wrap' }}>
        {['ALL', 'CONFIRMED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All Visits' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading your appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p className="empty-state-title">No Appointments Found</p>
            <p className="empty-state-text">You don't have any appointments matching this filter.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/patient/doctors')} style={{ marginTop: '12px' }}>
              Find a Doctor
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div className="avatar avatar-lg" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', fontSize: '1.25rem', marginTop: 4 }}>
                  {apt.doctorId?.fullName?.[0] || 'D'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{apt.doctorId?.fullName}</h3>
                    <span className={`badge ${getStatusBadgeClass(apt.status)}`}>{apt.status.replace('_', ' ')}</span>
                    <span className={`badge ${getPriorityBadgeClass(apt.priorityLevel)}`}>
                      {apt.priorityLevel} PRIORITY ({apt.priorityScore})
                    </span>
                  </div>

                  <div className="text-xs text-muted" style={{ marginBottom: '8px' }}>
                    {apt.doctorId?.specialization || 'General Practice'} • {apt.doctorId?.qualification}
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    <span>📅 <strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</span>
                    <span>⏰ <strong>Time:</strong> {apt.startTime}</span>
                    <span>💳 <strong>Fee:</strong> ₹{apt.doctorId?.consultationFee || 0}</span>
                  </div>

                  {apt.healthConcernId && (
                    <div style={{ marginTop: '8px', fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                      <strong>Reported Concern:</strong> {apt.healthConcernId.mainConcern}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {['CONFIRMED', 'WAITING', 'IN_CONSULTATION'].includes(apt.status) && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/patient/consultation-room/${apt._id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <HiOutlineVideoCamera size={16} /> Enter Video Room
                  </button>
                )}

                {apt.status === 'COMPLETED' && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/patient/records')}
                  >
                    View Medical Record
                  </button>
                )}

                {['REQUESTED', 'CONFIRMED', 'WAITING'].includes(apt.status) && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => { setCancellingApt(apt); setCancelReason(''); }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingApt && (
        <div className="modal-overlay" onClick={() => setCancellingApt(null)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Appointment</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setCancellingApt(null)}>
                <HiOutlineX size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-secondary" style={{ marginBottom: '14px' }}>
                Are you sure you want to cancel your appointment with <strong>{cancellingApt.doctorId?.fullName}</strong>?
              </p>
              <div className="form-group">
                <label className="form-label">Reason for cancellation (optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Schedule conflict, feeling better..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setCancellingApt(null)}>
                Keep Appointment
              </button>
              <button
                className="btn btn-danger"
                onClick={handleCancelAppointment}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
