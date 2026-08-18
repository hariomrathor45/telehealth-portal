import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import priorityApi from '../../services/priorityApi';
import { HiOutlineSparkles, HiOutlineExclamation, HiOutlineCheckCircle, HiOutlineArrowRight, HiOutlineShieldCheck } from 'react-icons/hi';
import { FaExclamationTriangle, FaHeartbeat } from 'react-icons/fa';

const COMMON_SYMPTOMS = [
  'fever',
  'chest pain',
  'shortness of breath',
  'cough',
  'headache',
  'dizziness',
  'vomiting',
  'palpitations / irregular heartbeat',
  'acute abdominal pain',
  'fatigue / severe weakness',
  'joint pain / swelling',
  'skin rash / allergy',
  'sore throat',
  'urinary burning',
  'loss of consciousness / fainting',
];

const SmartConsultation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mainConcern: '',
    symptoms: [],
    duration: 'today',
    severity: 'moderate',
    optionalInformation: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSymptomToggle = (symptom) => {
    setFormData((prev) => {
      const exists = prev.symptoms.includes(symptom);
      return {
        ...prev,
        symptoms: exists ? prev.symptoms.filter((s) => s !== symptom) : [...prev.symptoms, symptom],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mainConcern.trim()) {
      setError('Please describe your main health concern.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await priorityApi.assessHealthConcern(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Failed to calculate priority assessment.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadgeClass = (level) => {
    switch (level) {
      case 'VERY_HIGH': return 'badge-danger';
      case 'HIGH': return 'badge-warning';
      case 'MEDIUM': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Smart Urgency Triage & Priority Evaluation</h1>
          <p>Describe your health concern to evaluate consultation priority and enter the urgency queue</p>
        </div>
      </div>

      {/* Safety Notice */}
      <div style={{
        padding: '14px 18px',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <HiOutlineShieldCheck size={22} style={{ color: '#16a34a', flexShrink: 0 }} />
        <p className="text-sm" style={{ color: '#166534', margin: 0 }}>
          <strong>Decision Support Notice:</strong> This priority assessment is an automated queuing estimate based on reported symptom severity and clinical urgency markers. It is not a medical diagnosis.
        </p>
      </div>

      {!result ? (
        <div className="card" style={{ maxWidth: '800px' }}>
          <div className="card-header">
            <h3 className="card-title">Describe Your Health Concern</h3>
          </div>

          {error && (
            <div className="auth-error mb-3">
              <HiOutlineExclamation size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 1. Main Concern */}
            <div className="form-group">
              <label className="form-label">
                What health problem or symptom are you experiencing? *
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Mild chest tightness with difficulty breathing since yesterday evening..."
                value={formData.mainConcern}
                onChange={(e) => setFormData({ ...formData, mainConcern: e.target.value })}
                required
              />
            </div>

            {/* 2. Symptom Selection Checklist */}
            <div className="form-group">
              <label className="form-label">Select Associated Symptoms (Check all that apply):</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                {COMMON_SYMPTOMS.map((symptom) => {
                  const isChecked = formData.symptoms.includes(symptom);
                  return (
                    <label
                      key={symptom}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isChecked ? 'var(--primary-600)' : 'var(--border-color)'}`,
                        background: isChecked ? 'var(--primary-50)' : '#fff',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 150ms ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSymptomToggle(symptom)}
                      />
                      <span>{symptom}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Duration and Severity */}
            <div className="form-row" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">How long have you experienced this? *</label>
                <select
                  className="form-select"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                >
                  <option value="today">Started today</option>
                  <option value="1-3 days">1 to 3 days</option>
                  <option value="4-7 days">4 to 7 days</option>
                  <option value="more than 7 days">More than 7 days</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subjective Severity Level *</label>
                <select
                  className="form-select"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <option value="mild">Mild (Manageable discomfort)</option>
                  <option value="moderate">Moderate (Impacts daily activity)</option>
                  <option value="severe">Severe (Intense / distressing pain)</option>
                </select>
              </div>
            </div>

            {/* 4. Optional Context */}
            <div className="form-group">
              <label className="form-label">Additional Context / Medical History (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. History of hypertension, took paracetamol with no relief..."
                value={formData.optionalInformation}
                onChange={(e) => setFormData({ ...formData, optionalInformation: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
              style={{ marginTop: '16px' }}
            >
              {loading ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }}></div>
                  Evaluating Clinical Urgency Score...
                </>
              ) : (
                <>
                  <HiOutlineSparkles /> Calculate Urgency & Enter Priority Queue
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Result Evaluation Card */
        <div className="card animate-fadeIn" style={{ maxWidth: '800px' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div>
              <h3 className="card-title">Priority Assessment Result</h3>
              <p className="text-xs text-muted" style={{ margin: 0 }}>
                Algorithm: {result.assessment?.factorsSummary ? 'Rule-Based Clinical Scoring v1.2' : 'Decision Engine'}
              </p>
            </div>
            <span className={`badge ${getPriorityBadgeClass(result.assessment?.priorityLevel)}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
              {result.assessment?.priorityLevel} PRIORITY
            </span>
          </div>

          {/* Emergency Alert Banner if Very High / High Risk */}
          {result.assessment?.isEmergencyAlert && (
            <div style={{
              padding: '16px 20px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              margin: '20px 0',
              display: 'flex',
              gap: '12px',
              color: '#991b1b',
            }}>
              <FaExclamationTriangle size={24} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Acute Urgency Indicator Flagged:</strong>
                <p style={{ fontSize: '0.85rem', margin: '4px 0 0', lineHeight: 1.5 }}>
                  {result.assessment?.emergencyMessage}
                </p>
              </div>
            </div>
          )}

          {/* Score Display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '24px',
            margin: '24px 0',
            alignItems: 'center',
            padding: '20px',
            background: 'var(--slate-50)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-700)', lineHeight: 1 }}>
                {result.assessment?.priorityScore}
                <span style={{ fontSize: '1.25rem', color: 'var(--slate-400)', fontWeight: 500 }}>/100</span>
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--slate-600)', marginTop: 4 }}>
                Calculated Urgency Index
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Evaluation Breakdown:</h4>
              <ul style={{ fontSize: '0.85rem', color: 'var(--slate-600)', paddingLeft: '16px', lineHeight: 1.6 }}>
                <li>Reported Severity: <strong>{formData.severity.toUpperCase()}</strong></li>
                <li>Duration: <strong>{formData.duration}</strong></li>
                <li>Identified Symptoms: <strong>{formData.symptoms.length || 1} symptom(s)</strong></li>
                {result.assessment?.factorsSummary?.flaggedHighRisk?.length > 0 && (
                  <li style={{ color: 'var(--danger)' }}>
                    High-Risk Markers: <strong>{result.assessment.factorsSummary.flaggedHighRisk.join(', ')}</strong>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              onClick={() => navigate(`/patient/doctors?concern=${result.healthConcern?._id}&assessment=${result.assessment?.id}`)}
            >
              Book Priority Appointment with Doctor <HiOutlineArrowRight />
            </button>
            <button
              className="btn btn-outline"
              onClick={() => { setResult(null); }}
            >
              Submit Another Concern
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartConsultation;
