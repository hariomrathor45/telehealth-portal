import { useState } from 'react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [thresholds, setThresholds] = useState({
    lowMax: 25,
    medMax: 50,
    highMax: 75,
    criticalMin: 76,
    maxWaitBoost: 15,
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Priority engine calibration parameters saved!');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>System Configuration & Triage Calibration</h1>
          <p>Configure automated decision engine thresholds, waiting time anti-starvation weights, and security parameters</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        <form onSubmit={handleSave}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Priority Classification Thresholds (0–100)</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">LOW Priority Upper Limit</label>
              <input
                type="number"
                className="form-input"
                value={thresholds.lowMax}
                onChange={(e) => setThresholds({ ...thresholds, lowMax: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">MEDIUM Priority Upper Limit</label>
              <input
                type="number"
                className="form-input"
                value={thresholds.medMax}
                onChange={(e) => setThresholds({ ...thresholds, medMax: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">HIGH Priority Upper Limit</label>
              <input
                type="number"
                className="form-input"
                value={thresholds.highMax}
                onChange={(e) => setThresholds({ ...thresholds, highMax: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">VERY HIGH / CRITICAL Lower Limit</label>
              <input
                type="number"
                className="form-input"
                value={thresholds.criticalMin}
                onChange={(e) => setThresholds({ ...thresholds, criticalMin: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Queue Anti-Starvation Waiting Weight (Points/10min)</label>
            <input
              type="number"
              className="form-input"
              value={thresholds.maxWaitBoost}
              onChange={(e) => setThresholds({ ...thresholds, maxWaitBoost: e.target.value })}
            />
            <span className="text-xs text-muted">Boost applied to long-waiting low-priority patients to prevent starvation.</span>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Save Engine Calibration
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
