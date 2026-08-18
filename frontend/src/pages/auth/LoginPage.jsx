import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineExclamationCircle, HiOutlineArrowLeft } from 'react-icons/hi';
import { FaHeartbeat, FaUser, FaUserMd, FaShieldAlt } from 'react-icons/fa';
import '../../styles/auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError } = useAuth();

  const [selectedRole, setSelectedRole] = useState('PATIENT');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    clearError();
    setSelectedRole(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login({
      email: formData.email,
      password: formData.password,
      role: selectedRole,
    });

    if (result.success) {
      navigate(from || result.redirectPath, { replace: true });
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      {/* Left Branding Panel */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <Link to="/" className="auth-logo" style={{ textDecoration: 'none' }}>
            <div className="auth-logo-icon">
              <FaHeartbeat />
            </div>
            <div className="auth-logo-text">
              Tele<span>Health</span>
            </div>
          </Link>

          <h2>Smart Priority-Based Telehealth Portal</h2>
          <p>
            An intelligent healthcare consultation system assigning urgency priorities to medical concerns for timely and organized medical care.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <FaHeartbeat />
              </div>
              <div className="auth-feature-text">
                <h4>Clinical Triage Engine</h4>
                <p>Urgency scoring (0–100) based on symptom duration and severity</p>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <FaShieldAlt />
              </div>
              <div className="auth-feature-text">
                <h4>Admin-Verified Doctors</h4>
                <p>All medical professionals are verified with credentials & license check</p>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <FaUserMd />
              </div>
              <div className="auth-feature-text">
                <h4>Priority Waiting Queue</h4>
                <p>Doctors treat urgent cases first while maintaining fair queue flow</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Link to="/" className="back-link" style={{ margin: 0 }}>
              <HiOutlineArrowLeft /> Back to Home
            </Link>
            <ThemeToggle />
          </div>

          <div className="auth-form-header">
            <h1>Welcome Back</h1>
            <p>Select your portal role and sign in to continue</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="role-selector-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
            <button
              type="button"
              className={`btn btn-sm ${selectedRole === 'PATIENT' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleRoleSelect('PATIENT')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <FaUser size={13} /> Patient
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedRole === 'DOCTOR' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleRoleSelect('DOCTOR')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <FaUserMd size={13} /> Doctor
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedRole === 'ADMIN' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleRoleSelect('ADMIN')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <FaShieldAlt size={13} /> Admin
            </button>
          </div>

          {error && (
            <div className="auth-error">
              <HiOutlineExclamationCircle size={18} />
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                {selectedRole === 'PATIENT' ? 'Patient Email' : selectedRole === 'DOCTOR' ? 'Doctor Email' : 'Admin Email'}
              </label>
              <div className="form-input-icon">
                <span className="icon"><HiOutlineMail /></span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder={
                    selectedRole === 'PATIENT'
                      ? 'patient@telehealth.com'
                      : selectedRole === 'DOCTOR'
                      ? 'dr.priya@telehealth.com'
                      : 'admin@telehealth.com'
                  }
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="form-input-icon">
                <span className="icon"><HiOutlineLockClosed /></span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit"
              disabled={loading}
              style={{ marginTop: '16px' }}
            >
              {loading ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }}></div>
                  Signing in to {selectedRole}...
                </>
              ) : (
                `Sign In as ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}`
              )}
            </button>
          </form>

          {selectedRole !== 'ADMIN' && (
            <>
              <div className="auth-divider">
                <span>New to TeleHealth?</span>
              </div>

              <div className="auth-register-options">
                <Link to="/register/patient" className="btn btn-outline">
                  Register as Patient
                </Link>
                <Link to="/register/doctor" className="btn btn-outline">
                  Register as Doctor
                </Link>
              </div>
            </>
          )}

          <div className="auth-footer">
            <p className="text-xs text-muted" style={{ marginTop: '20px' }}>
              Academic Consultation Support Prototype. Not intended for direct emergency clinical triage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
