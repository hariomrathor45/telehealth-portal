import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientApi from '../../services/patientApi';
import toast from 'react-hot-toast';

const PatientProfile = () => {
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await patientApi.getProfile();
        if (res.data) {
          setFormData({
            fullName: res.data.fullName || '',
            phone: res.data.phone || '',
            dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.split('T')[0] : '',
            gender: res.data.gender || '',
            address: res.data.address || '',
            emergencyContact: res.data.emergencyContact || '',
          });
        }
      } catch (err) {
        console.warn('Profile fetch error:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await patientApi.updateProfile(formData);
      toast.success('Profile updated successfully!');
      refreshProfile();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Patient Profile</h1>
          <p>Manage your personal details and emergency contacts</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="fullName"
              className="form-input"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Registered Email</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ background: 'var(--slate-100)', cursor: 'not-allowed' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <textarea
              name="address"
              className="form-textarea"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="Your home address..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Emergency Contact Details</label>
            <input
              type="text"
              name="emergencyContact"
              className="form-input"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Name, relationship, and phone number"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '12px' }}
          >
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
