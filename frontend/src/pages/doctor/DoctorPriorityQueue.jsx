import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorApi from '../../services/doctorApi';
import { HiOutlineClock, HiOutlineRefresh, HiOutlineVideoCamera, HiOutlineExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DoctorPriorityQueue = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getMyQueue();
      setQueue(res.data?.queue || []);
    } catch (err) {
      toast.error('Failed to load priority queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const getPriorityBadgeClass = (level) => {
    switch (level) {
      case 'VERY_HIGH': return 'badge-danger';
      case 'HIGH': return 'badge-warning';
      case 'MEDIUM': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  const calculateWaitingTime = (queueEnteredAt) => {
    if (!queueEnteredAt) return '< 5m';
    const diffMin = Math.round((new Date() - new Date(queueEnteredAt)) / 60000);
    return `${Math.max(diffMin, 1)} min`;
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Priority-Ordered Consultation Queue</h1>
          <p>Patients ordered dynamically by clinical urgency score and waiting duration</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchQueue}>
          <HiOutlineRefresh size={16} /> Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Organizing priority queue...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <p className="empty-state-title">No Patients Waiting</p>
            <p className="empty-state-text">Your priority queue is clear. Check upcoming appointments for the day.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Priority Level</th>
                <th>Triage Score</th>
                <th>Waited</th>
                <th>Chief Health Concern & Symptoms</th>
                <th>Slot</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((apt) => (
                <tr
                  key={apt._id}
                  style={{
                    background: apt.status === 'IN_CONSULTATION' ? '#f0fdf4' : undefined,
                  }}
                >
                  <td>
                    <div className="font-semibold">{apt.patientId?.fullName}</div>
                    <div className="text-xs text-muted">
                      {apt.patientId?.gender || 'Patient'} • {apt.patientId?.phone || 'No phone'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityBadgeClass(apt.priorityLevel)}`}>
                      {apt.priorityLevel}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono font-bold" style={{ color: 'var(--primary-700)', fontSize: '1rem' }}>
                      {apt.priorityScore}
                    </span>
                    <span className="text-xs text-muted">/100</span>
                  </td>
                  <td className="text-xs text-muted font-medium">
                    ⏱️ {calculateWaitingTime(apt.queueEnteredAt)}
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 2 }}>
                      {apt.healthConcernId?.mainConcern || 'General consultation request'}
                    </div>
                    {apt.healthConcernId?.symptoms?.length > 0 && (
                      <div className="text-xs text-muted">
                        Symptoms: {apt.healthConcernId.symptoms.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="font-mono text-xs font-semibold">{apt.startTime}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/doctor/consultation/${apt._id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <HiOutlineVideoCamera size={14} />
                      {apt.status === 'IN_CONSULTATION' ? 'Resume' : 'Consult'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorPriorityQueue;
