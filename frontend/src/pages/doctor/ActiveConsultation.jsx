import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import appointmentApi from '../../services/appointmentApi';
import consultationApi from '../../services/consultationApi';
import {
  HiOutlineVideoCamera, HiOutlineMicrophone, HiOutlinePhoneMissedCall,
  HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineSave,
  HiOutlineUser, HiOutlineClock, HiOutlineShieldCheck
} from 'react-icons/hi';
import { FaUserMd, FaHeartbeat } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ActiveConsultation = () => {
  const { id: appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Video controls
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Clinical Form Data
  const [clinicalData, setClinicalData] = useState({
    complaint: '',
    summary: '',
    doctorObservations: '',
    advice: '',
    followUp: '',
    doctorNotes: '',
  });

  useEffect(() => {
    const initConsultation = async () => {
      setLoading(true);
      try {
        const aptRes = await appointmentApi.getAppointmentById(appointmentId);
        setAppointment(aptRes.data);

        // Start consultation on backend
        const startRes = await consultationApi.startConsultation(appointmentId);
        const cons = startRes.data?.consultation;
        setConsultation(cons);

        if (cons) {
          setClinicalData({
            complaint: cons.complaint || aptRes.data?.healthConcernId?.mainConcern || '',
            summary: cons.summary || '',
            doctorObservations: cons.doctorObservations || '',
            advice: cons.advice || '',
            followUp: cons.followUp || '',
            doctorNotes: cons.doctorNotes || '',
          });
        }
      } catch (err) {
        toast.error(err.message || 'Failed to initialize consultation session');
      } finally {
        setLoading(false);
      }
    };
    initConsultation();
  }, [appointmentId]);

  // Live timer
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

  const handleSaveNotes = async () => {
    if (!consultation) return;
    setSaving(true);
    try {
      await consultationApi.saveNotes(consultation._id, clinicalData);
      toast.success('Clinical notes saved');
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!clinicalData.advice.trim() && !clinicalData.doctorObservations.trim()) {
      toast.error('Please enter clinical observations or prescription advice before finalizing.');
      return;
    }

    setSaving(true);
    try {
      await consultationApi.completeConsultation(consultation._id, clinicalData);
      toast.success('Consultation completed! Medical Record successfully created.');
      navigate('/doctor/queue');
    } catch (err) {
      toast.error(err.message || 'Failed to complete consultation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Connecting to secure consultation room...</p>
      </div>
    );
  }

  const patient = appointment?.patientId || {};
  const concern = appointment?.healthConcernId || {};

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Banner */}
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
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 10px #22c55e',
          }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc' }}>
              Active Telehealth Session — {patient.fullName}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Appointment #{appointmentId?.slice(-6)} • {appointment?.priorityLevel} Priority ({appointment?.priorityScore}/100)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: '1rem', fontWeight: 600, color: '#38bdf8' }}>
            ⏱️ {formatTimer(callDuration)}
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleCompleteConsultation} disabled={saving}>
            Finalize & Complete Visit
          </button>
        </div>
      </div>

      {/* Main Grid: Video Stream + Clinical Notes Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px' }}>
        {/* Left: Video Interface & Patient Summary */}
        <div>
          {/* Video Stream Simulated Card */}
          <div style={{
            background: '#1e293b',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            aspectRatio: '16/10',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            marginBottom: '16px',
          }}>
            {videoActive ? (
              <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                <div className="avatar avatar-lg" style={{ width: 80, height: 80, fontSize: '2rem', background: '#334155', color: '#f8fafc', margin: '0 auto 12px' }}>
                  {patient.fullName?.[0] || 'P'}
                </div>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{patient.fullName}</div>
                <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>● Connected via Secure Audio/Video Stream</div>
              </div>
            ) : (
              <div style={{ color: '#64748b' }}>Camera is muted</div>
            )}

            {/* Doctor Self Picture-in-Picture */}
            <div style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 120,
              height: 80,
              background: '#0f172a',
              borderRadius: '8px',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}>
              Dr. Self View
            </div>

            {/* Call Controls Bar */}
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '12px',
              background: 'rgba(15, 23, 42, 0.85)',
              padding: '8px 16px',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
            }}>
              <button
                type="button"
                className={`btn btn-icon ${micActive ? 'btn-ghost' : 'btn-danger'}`}
                style={{ color: '#fff' }}
                onClick={() => setMicActive(!micActive)}
                title={micActive ? 'Mute Mic' : 'Unmute Mic'}
              >
                <HiOutlineMicrophone size={18} />
              </button>
              <button
                type="button"
                className={`btn btn-icon ${videoActive ? 'btn-ghost' : 'btn-danger'}`}
                style={{ color: '#fff' }}
                onClick={() => setVideoActive(!videoActive)}
                title={videoActive ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                <HiOutlineVideoCamera size={18} />
              </button>
            </div>
          </div>

          {/* Patient Health Concern Context */}
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header">
              <h4 className="card-title" style={{ fontSize: '0.95rem' }}>Patient Triage Profile</h4>
              <span className={`badge ${
                appointment?.priorityLevel === 'VERY_HIGH' ? 'badge-danger' :
                appointment?.priorityLevel === 'HIGH' ? 'badge-warning' : 'badge-info'
              }`}>
                {appointment?.priorityLevel} Priority
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
              <div><strong>Age / Gender:</strong> {patient.dateOfBirth ? `${Math.floor((new Date() - new Date(patient.dateOfBirth)) / 31557600000)} yrs` : 'N/A'} • {patient.gender || 'N/A'}</div>
              <div><strong>Phone:</strong> {patient.phone || 'N/A'}</div>
              <div><strong>Chief Concern:</strong> "{concern.mainConcern || 'N/A'}"</div>
              {concern.symptoms?.length > 0 && (
                <div><strong>Symptoms:</strong> {concern.symptoms.join(', ')}</div>
              )}
              {concern.optionalInformation && (
                <div><strong>Patient Notes:</strong> {concern.optionalInformation}</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Doctor's Clinical Entry Form */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <h3 className="card-title">Consultation Notes & Prescription</h3>
            <button className="btn btn-outline btn-sm" onClick={handleSaveNotes} disabled={saving}>
              <HiOutlineSave size={14} /> {saving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleCompleteConsultation(); }}>
            <div className="form-group">
              <label className="form-label">Clinical Observations / Physical Symptoms *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Patient presents with clear lung sounds, normal BP, mild throat erythema..."
                value={clinicalData.doctorObservations}
                onChange={(e) => setClinicalData({ ...clinicalData, doctorObservations: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Diagnosis / Consultation Summary</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Acute upper respiratory infection / Seasonal allergy"
                value={clinicalData.summary}
                onChange={(e) => setClinicalData({ ...clinicalData, summary: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rx Advice & Prescription Instructions *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. 1. Tab Paracetamol 650mg TDS x 3 days&#10;2. Cetirizine 10mg OD bedtime&#10;3. Warm salt water gargle"
                value={clinicalData.advice}
                onChange={(e) => setClinicalData({ ...clinicalData, advice: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Follow-up Recommendation</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Review after 5 days if fever persists; seek ER if breathlessness worsens."
                value={clinicalData.followUp}
                onChange={(e) => setClinicalData({ ...clinicalData, followUp: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Private Clinical Notes (Confidential)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Internal notes not visible on patient summary..."
                value={clinicalData.doctorNotes}
                onChange={(e) => setClinicalData({ ...clinicalData, doctorNotes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleSaveNotes}
                disabled={saving}
              >
                Save Draft Notes
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={saving}
              >
                <HiOutlineCheckCircle size={16} /> Complete Consultation & Sign Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActiveConsultation;
