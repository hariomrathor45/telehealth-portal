import { useState, useEffect } from 'react';
import appointmentApi from '../../services/appointmentApi';
import { HiOutlineCalendar, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminAppointments = () => {
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

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>System-Wide Appointments Overview</h1>
          <p>Monitor all requested, waiting, in-consultation, and completed consultations</p>
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        {['ALL', 'CONFIRMED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All' : f.replace('_', ' ')}
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
            <p className="empty-state-title">No Appointments Found</p>
            <p className="empty-state-text">No records match the current status filter.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Priority</th>
                <th>Date & Slot</th>
                <th>Chief Concern</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt._id}>
                  <td className="font-semibold">{apt.patientId?.fullName}</td>
                  <td>{apt.doctorId?.fullName} ({apt.doctorId?.specialization || 'Gen'})</td>
                  <td>
                    <span className={`badge ${
                      apt.priorityLevel === 'VERY_HIGH' ? 'badge-danger' :
                      apt.priorityLevel === 'HIGH' ? 'badge-warning' : 'badge-neutral'
                    }`}>
                      {apt.priorityLevel} ({apt.priorityScore})
                    </span>
                  </td>
                  <td className="text-xs">
                    {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.startTime}
                  </td>
                  <td style={{ maxWidth: '240px' }} className="text-xs text-secondary">
                    {apt.healthConcernId?.mainConcern || 'N/A'}
                  </td>
                  <td>
                    <span className={`badge ${
                      apt.status === 'COMPLETED' ? 'badge-neutral' :
                      apt.status === 'IN_CONSULTATION' ? 'badge-success' :
                      apt.status === 'WAITING' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {apt.status}
                    </span>
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

export default AdminAppointments;
