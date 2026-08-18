import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import doctorApi from '../../services/doctorApi';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await doctorApi.getMyDashboard();
        setProfile(res.data?.profile || {});
      } catch (err) {
        console.warn('Doctor profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Doctor Professional Profile</h1>
          <p>Medical credentials, specialization details, and verification record</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '750px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="avatar avatar-lg" style={{ width: 64, height: 64, fontSize: '1.5rem', background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
            {profile?.fullName?.[0] || 'D'}
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem' }}>{profile?.fullName}</h2>
            <div className="text-sm text-muted">{profile?.qualification} • {profile?.specialization}</div>
            <span className={`badge ${profile?.verificationStatus === 'APPROVED' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: 6 }}>
              {profile?.verificationStatus === 'APPROVED' ? '✅ Verified Specialist' : '⏳ Pending Verification'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
          <div>
            <div className="text-xs text-muted">Email Address</div>
            <div className="font-semibold">{user?.email}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Medical Registration Number</div>
            <div className="font-mono font-semibold">{profile?.medicalRegistrationNumber || 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Years of Experience</div>
            <div className="font-semibold">{profile?.experienceYears || 0} Years</div>
          </div>
          <div>
            <div className="text-xs text-muted">Consultation Fee</div>
            <div className="font-semibold" style={{ color: 'var(--primary-700)' }}>₹{profile?.consultationFee || 0}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Hospital / Clinic</div>
            <div className="font-semibold">{profile?.hospitalClinic || 'TeleHealth Partner'}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Contact Phone</div>
            <div className="font-semibold">{profile?.phone || 'N/A'}</div>
          </div>
        </div>

        {profile?.bio && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div className="text-xs text-muted" style={{ marginBottom: 4 }}>Professional Bio</div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--slate-700)', margin: 0 }}>{profile.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
