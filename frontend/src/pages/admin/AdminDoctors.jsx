import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { HiOutlineUserGroup, HiOutlineSearch, HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDoctors({ search });
      setDoctors(res.data?.doctors || []);
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggleStatus = async (doc) => {
    const newStatus = doc.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApi.toggleDoctorStatus(doc._id, newStatus, `Admin set doctor status to ${newStatus}`);
      toast.success(`Doctor account marked as ${newStatus}`);
      fetchDoctors();
    } catch (err) {
      toast.error('Failed to update doctor status');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>All Registered Doctors</h1>
          <p>Complete directory of verified and pending medical practitioners</p>
        </div>
      </div>

      <div className="card mb-3" style={{ padding: '14px 20px' }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchDoctors(); }}>
          <div className="form-input-icon">
            <span className="icon"><HiOutlineSearch /></span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by doctor name, specialization, registration number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading doctor directory...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🩺</div>
            <p className="empty-state-title">No Doctors Found</p>
            <p className="empty-state-text">No doctor profiles match your filter.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Medical Reg. No.</th>
                <th>Verification</th>
                <th>Account Status</th>
                <th>Consultation Fee</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id}>
                  <td>
                    <div className="font-semibold">{doc.fullName}</div>
                    <div className="text-xs text-muted">{doc.userId?.email}</div>
                  </td>
                  <td>{doc.specialization || 'General'}</td>
                  <td className="font-mono text-xs">{doc.medicalRegistrationNumber}</td>
                  <td>
                    <span className={`badge ${
                      doc.verificationStatus === 'APPROVED' ? 'badge-success' :
                      doc.verificationStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {doc.verificationStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${doc.accountStatus === 'ACTIVE' ? 'badge-info' : 'badge-danger'}`}>
                      {doc.accountStatus}
                    </span>
                  </td>
                  <td className="font-semibold">₹{doc.consultationFee || 0}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${doc.accountStatus === 'ACTIVE' ? 'btn-outline' : 'btn-success'}`}
                      onClick={() => handleToggleStatus(doc)}
                    >
                      {doc.accountStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
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

export default AdminDoctors;
