import { useState, useEffect } from 'react';
import doctorApi from '../../services/doctorApi';
import { HiOutlineUserGroup, HiOutlineSearch, HiOutlineDocumentText } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await doctorApi.getMyPatients();
        setPatients(res.data || []);
      } catch (err) {
        toast.error('Failed to load patient directory');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Authorized Patients</h1>
          <p>Directory of patients who have scheduled or completed consultations with you</p>
        </div>
      </div>

      <div className="card mb-3" style={{ padding: '14px 20px' }}>
        <div className="form-input-icon">
          <span className="icon"><HiOutlineSearch /></span>
          <input
            type="text"
            className="form-input"
            placeholder="Search patients by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading patient directory...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-title">No Patients Found</p>
            <p className="empty-state-text">Patients who book consultations with you will automatically appear in this authorized roster.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredPatients.map((p) => (
            <div key={p._id} className="card" style={{ margin: 0, border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <div className="avatar avatar-md" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                  {p.fullName?.[0] || 'P'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{p.fullName}</h4>
                  <div className="text-xs text-muted">
                    {p.gender || 'Patient'} • {p.dateOfBirth ? `${Math.floor((new Date() - new Date(p.dateOfBirth)) / 31557600000)} yrs` : 'Age N/A'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                <div>📞 <strong>Phone:</strong> {p.phone || 'N/A'}</div>
                <div>🏠 <strong>Address:</strong> {p.address || 'N/A'}</div>
                {p.emergencyContact && (
                  <div>🚨 <strong>Emergency:</strong> {p.emergencyContact}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
