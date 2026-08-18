import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import appointmentApi from '../../services/appointmentApi';
import {
  HiOutlineVideoCamera, HiOutlineMicrophone, HiOutlinePhoneMissedCall,
  HiOutlineClock, HiOutlineDocumentText, HiOutlineArrowLeft
} from 'react-icons/hi';
import { FaUserMd, FaHeartbeat } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VideoConsultationRoom = () => {
  const { id: appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const fetchApt = async () => {
      setLoading(true);
      try {
        const res = await appointmentApi.getAppointmentById(appointmentId);
        setAppointment(res.data);
      } catch (err) {
        toast.error(err.message || 'Unauthorized or invalid consultation session');
        navigate('/patient/appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchApt();
  }, [appointmentId, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Connecting to doctor's consultation session...</p>
      </div>
    );
  }

  const doctor = appointment?.doctorId || {};

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{
        padding: '14px 20px',
        background: '#0f172a',
        color: '#fff',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patient/appointments')} style={{ color: '#94a3b8' }}>
            <HiOutlineArrowLeft size={18} />
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc' }}>
              Telehealth Consultation with {doctor.fullName}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {doctor.specialization || 'Specialist'} • Session #{appointmentId?.slice(-6)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: '1rem', fontWeight: 600, color: '#38bdf8' }}>
            ⏱️ {formatTimer(callDuration)}
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => navigate('/patient/appointments')}>
            Leave Session
          </button>
        </div>
      </div>

      {/* Video Screen */}
      <div style={{
        background: '#1e293b',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        aspectRatio: '16/9',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
        marginBottom: '20px',
      }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div className="avatar avatar-lg" style={{ width: 90, height: 90, fontSize: '2.5rem', background: '#334155', color: '#38bdf8', margin: '0 auto 14px' }}>
            {doctor.fullName?.[0] || 'D'}
          </div>
          <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '1.2rem' }}>{doctor.fullName}</div>
          <div style={{ fontSize: '0.85rem', color: '#22c55e', marginTop: 4 }}>● Doctor is Active in Session</div>
          <p className="text-xs text-muted" style={{ marginTop: 8, maxWidth: 400 }}>
            Audio and video are streaming through encrypted telehealth channel.
          </p>
        </div>

        {/* Patient Self PiP */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 140,
          height: 90,
          background: '#0f172a',
          borderRadius: '10px',
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38bdf8',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}>
          {videoActive ? 'Your Camera (Live)' : 'Camera Off'}
        </div>

        {/* Controls */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '14px',
          background: 'rgba(15, 23, 42, 0.9)',
          padding: '10px 20px',
          borderRadius: '50px',
          backdropFilter: 'blur(10px)',
        }}>
          <button
            type="button"
            className={`btn btn-icon ${micActive ? 'btn-ghost' : 'btn-danger'}`}
            style={{ color: '#fff' }}
            onClick={() => setMicActive(!micActive)}
            title={micActive ? 'Mute' : 'Unmute'}
          >
            <HiOutlineMicrophone size={20} />
          </button>
          <button
            type="button"
            className={`btn btn-icon ${videoActive ? 'btn-ghost' : 'btn-danger'}`}
            style={{ color: '#fff' }}
            onClick={() => setVideoActive(!videoActive)}
            title={videoActive ? 'Turn off video' : 'Turn on video'}
          >
            <HiOutlineVideoCamera size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultationRoom;
