import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import ThemeToggle from '../../components/common/ThemeToggle';
import { FaHeartbeat } from 'react-icons/fa';
import { HiOutlineArrowLeft, HiOutlineExclamationCircle, HiOutlineUpload, HiOutlineX, HiOutlineDocument } from 'react-icons/hi';
import toast from 'react-hot-toast';
import '../../styles/auth.css';

const DoctorRegisterPage = () => {
  const navigate = useNavigate();
  const { registerDoctor, error, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [validationErr, setValidationErr] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    medicalRegistrationNumber: '',
    qualification: '',
    specialization: '',
    experienceYears: '',
    hospitalClinic: '',
    consultationFee: '',
    bio: '',
  });

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await authService.getSpecializations();
        setSpecializations(response.data || []);
      } catch (err) {
        console.error('Failed to load specializations:', err);
      }
    };
    fetchSpecializations();
  }, []);

  const handleChange = (e) => {
    clearError();
    setValidationErr('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((f) => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return validTypes.includes(f.type) && f.size <= maxSize;
    });
    setDocuments((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        documentType: 'medical_license',
        originalName: file.name,
        mimeType: file.type,
      })),
    ]);
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setValidationErr('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setValidationErr('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await registerDoctor({
      ...formData,
      experienceYears: parseInt(formData.experienceYears) || 0,
      consultationFee: parseFloat(formData.consultationFee) || 0,
      submittedDocuments: documents.map((d) => ({
        documentType: d.documentType,
        originalName: d.originalName,
        mimeType: d.mimeType,
        storageKey: `uploads/${d.originalName}`,
      })),
    });

    if (result.success) {
      toast.success('Doctor registration submitted! Awaiting admin verification.');
      navigate('/doctor/dashboard', { replace: true });
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

        <h1>Doctor Registration</h1>
        <p className="subtitle">
          Join our clinical network as a healthcare professional. Your credentials will be reviewed and verified by administrators.
        </p>

        {(error || validationErr) && (
          <div className="auth-error">
            <HiOutlineExclamationCircle size={18} />
            {error || validationErr}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="registration-section">
            <h3>👤 Personal Demographics</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="doc-name">Full Name *</label>
              <input
                id="doc-name"
                type="text"
                name="fullName"
                className="form-input"
                placeholder="Dr. Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="doc-email">Email Address *</label>
                <input
                  id="doc-email"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="doctor@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-phone">Phone Number</label>
                <input
                  id="doc-phone"
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
                <label className="form-label" htmlFor="doc-password">Password *</label>
                <input
                  id="doc-password"
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
                <label className="form-label" htmlFor="doc-confirm">Confirm Password *</label>
                <input
                  id="doc-confirm"
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
                <label className="form-label" htmlFor="doc-dob">Date of Birth</label>
                <input
                  id="doc-dob"
                  type="date"
                  name="dateOfBirth"
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-gender">Gender</label>
                <select
                  id="doc-gender"
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="doc-address">Clinic or Practice Address</label>
              <textarea
                id="doc-address"
                name="address"
                className="form-textarea"
                placeholder="Hospital/clinic physical address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                style={{ minHeight: '60px' }}
              />
            </div>
          </div>

          {/* Professional Details */}
          <div className="registration-section">
            <h3>🩺 Professional Credentials</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="doc-reg-num">Medical Registration / License No. *</label>
                <input
                  id="doc-reg-num"
                  type="text"
                  name="medicalRegistrationNumber"
                  className="form-input"
                  placeholder="e.g. MCI-2018-9988"
                  value={formData.medicalRegistrationNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-qualification">Degrees & Qualification *</label>
                <input
                  id="doc-qualification"
                  type="text"
                  name="qualification"
                  className="form-input"
                  placeholder="e.g. MBBS, MD, MS, DM"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="doc-specialization">Specialization *</label>
                <select
                  id="doc-specialization"
                  name="specialization"
                  className="form-select"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select primary specialty</option>
                  {specializations.map((spec) => (
                    <option key={spec._id || spec.name} value={spec.name}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-experience">Years of Experience</label>
                <input
                  id="doc-experience"
                  type="number"
                  name="experienceYears"
                  className="form-input"
                  placeholder="e.g. 8"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  min="0"
                  max="60"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="doc-hospital">Hospital / Clinic Affiliation</label>
                <input
                  id="doc-hospital"
                  type="text"
                  name="hospitalClinic"
                  className="form-input"
                  placeholder="Hospital or Medical Center"
                  value={formData.hospitalClinic}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-fee">Consultation Fee (₹)</label>
                <input
                  id="doc-fee"
                  type="number"
                  name="consultationFee"
                  className="form-input"
                  placeholder="e.g. 500"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="doc-bio">Professional Biography</label>
              <textarea
                id="doc-bio"
                name="bio"
                className="form-textarea"
                placeholder="Brief clinical background, specialties, and patient care philosophy..."
                value={formData.bio}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          {/* Verification Documents Upload */}
          <div className="registration-section">
            <h3>📄 Verification Documents</h3>
            <p className="text-sm text-muted mb-2">
              Attach your medical council certificate, degrees, and identification for admin verification.
            </p>

            <div
              className="file-upload"
              onClick={() => document.getElementById('doc-files').click()}
            >
              <div className="file-upload-icon">
                <HiOutlineUpload />
              </div>
              <p className="file-upload-text">Click to browse verification documents</p>
              <p className="file-upload-hint">PDF, JPG, PNG — Max 10MB per document</p>
              <input
                id="doc-files"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {documents.length > 0 && (
              <div className="uploaded-files">
                {documents.map((docItem, index) => (
                  <div key={index} className="uploaded-file">
                    <span className="uploaded-file-name">
                      <HiOutlineDocument /> {docItem.originalName}
                    </span>
                    <button
                      type="button"
                      className="uploaded-file-remove"
                      onClick={() => removeDocument(index)}
                    >
                      <HiOutlineX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            padding: '12px 16px',
            background: 'var(--info-light)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}>
            <p className="text-sm" style={{ color: 'var(--info-dark)', margin: 0 }}>
              ℹ️ Your account will start in <strong>PENDING verification status</strong>. An administrator will inspect your license credentials before activating your profile.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }}></div>
                Submitting Doctor Application...
              </>
            ) : (
              'Submit Doctor Registration'
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

export default DoctorRegisterPage;
