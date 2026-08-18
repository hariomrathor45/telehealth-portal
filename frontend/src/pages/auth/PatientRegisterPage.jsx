import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import { FaHeartbeat } from 'react-icons/fa';
import { HiOutlineArrowLeft, HiOutlineExclamationCircle } from 'react-icons/hi';
import '../../styles/auth.css';

const PatientRegisterPage = () => {
  const navigate = useNavigate();
  const { registerPatient, error, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
  });

  const handleChange = (e) => {
    clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return alert('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return alert('Password must be at least 6 characters');
    }

    setLoading(true);
    const result = await registerPatient(formData);

    if (result.success) {
      navigate('/patient/dashboard', { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Link to="/login" className="back-link" style={{ margin: 0 }}>
            <HiOutlineArrowLeft /> Back to Login
          </Link>
          <ThemeToggle />
        </div>

        <div className="auth-logo" style={{ justifyContent: 'center' }}>
          <div className="auth-logo-icon" style={{ width: 44, height: 44, fontSize: '1.25rem' }}>
            <FaHeartbeat />
          </div>
          <div className="auth-logo-text" style={{ fontSize: '1.5rem' }}>
            Tele<span>Health</span>
          </div>
        </div>

        <h1>Patient Registration</h1>
        <p className="subtitle">Create your account to access healthcare consultations</p>

        {error && (
          <div className="auth-error">
            <HiOutlineExclamationCircle size={18} />
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="registration-section">
            <h3>👤 Personal Information</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name *</label>
              <input
                id="reg-name"
                type="text"
                name="fullName"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email *</label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Phone Number</label>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password *</label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm Password *</label>
                <input
                  id="reg-confirm"
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-dob">Date of Birth</label>
                <input
                  id="reg-dob"
                  type="date"
                  name="dateOfBirth"
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-gender">Gender</label>
                <select
                  id="reg-gender"
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-address">Address</label>
              <textarea
                id="reg-address"
                name="address"
                className="form-textarea"
                placeholder="Your address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                style={{ minHeight: '60px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-emergency">Emergency Contact</label>
              <input
                id="reg-emergency"
                type="text"
                name="emergencyContact"
                className="form-input"
                placeholder="Name and phone number"
                value={formData.emergencyContact}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }}></div>
                Creating Account...
              </>
            ) : (
              'Create Patient Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientRegisterPage;
