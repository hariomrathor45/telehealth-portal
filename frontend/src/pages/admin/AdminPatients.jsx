import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { HiOutlineUserGroup, HiOutlineSearch, HiOutlineLockClosed, HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPatients({ search });
      setPatients(res.data?.patients || []);
    } catch (err) {
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleToggleStatus = async (patient) => {
    const newStatus = patient.userId?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApi.togglePatientStatus(patient._id, newStatus, `Admin set status to ${newStatus}`);
      toast.success(`Patient account marked as ${newStatus}`);
      fetchPatients();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Patient Accounts Management</h1>
          <p>Supervise registered patients and manage account access status</p>
        </div>
      </div>

      <div className="card mb-3" style={{ padding: '14px 20px' }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchPatients(); }}>
          <div className="form-input-icon">
            <span className="icon"><HiOutlineSearch /></span>
            <input
              type="text"
              className="form-input"
              placeholder="Search patients by name, phone, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading patients...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-title">No Patients Found</p>
            <p className="empty-state-text">No patient accounts match your search filter.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Gender / Age</th>
                <th>Status</th>
                <th>Registered On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id}>
                  <td className="font-semibold">{p.fullName}</td>
                  <td className="text-muted">{p.userId?.email}</td>
                  <td>{p.phone || 'N/A'}</td>
                  <td>{p.gender || 'N/A'}</td>
                  <td>
                    <span className={`badge ${p.userId?.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {p.userId?.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="text-xs text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${p.userId?.status === 'ACTIVE' ? 'btn-outline' : 'btn-success'}`}
                      onClick={() => handleToggleStatus(p)}
                    >
                      {p.userId?.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
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

export default AdminPatients;
