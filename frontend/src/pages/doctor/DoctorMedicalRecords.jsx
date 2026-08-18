import { useState, useEffect } from 'react';
import medicalRecordApi from '../../services/medicalRecordApi';
import { HiOutlineDocumentText, HiOutlineSearch, HiOutlineEye, HiOutlinePrinter, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DoctorMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await medicalRecordApi.getMyRecords();
        setRecords(res.data || []);
      } catch (err) {
        toast.error('Failed to load consultation records');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((r) =>
    r.patientId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.observations?.toLowerCase().includes(search.toLowerCase()) ||
    r.advice?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Clinical Medical Records</h1>
          <p>Electronic health records authored by you during patient consultations</p>
        </div>
      </div>

      <div className="card mb-3" style={{ padding: '14px 20px' }}>
        <div className="form-input-icon">
          <span className="icon"><HiOutlineSearch /></span>
          <input
            type="text"
            className="form-input"
            placeholder="Search records by patient name, observations, advice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading clinical records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-title">No Medical Records</p>
            <p className="empty-state-text">Consultation notes finalized in the consultation room will appear here.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredRecords.map((rec) => (
            <div
              key={rec._id}
              className="card"
              style={{
                margin: 0,
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="avatar" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                      {rec.patientId?.fullName?.[0] || 'P'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>{rec.patientId?.fullName}</h4>
                      <div className="text-xs text-muted">Date: {new Date(rec.recordDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
                  {rec.complaint && (
                    <div><strong>Chief Complaint:</strong> {rec.complaint}</div>
                  )}
                  {rec.observations && (
                    <div><strong>Observations:</strong> {rec.observations}</div>
                  )}
                  {rec.advice && (
                    <div style={{ color: 'var(--primary-700)' }}><strong>Rx Advice:</strong> {rec.advice}</div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedRecord(rec)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <HiOutlineEye size={14} /> Full Record View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Medical Summary — {selectedRecord.patientId?.fullName}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedRecord(null)}>
                <HiOutlineX size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '14px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div><strong>Patient:</strong> {selectedRecord.patientId?.fullName}</div>
                <div><strong>Date:</strong> {new Date(selectedRecord.recordDate).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <div>
                  <strong>Chief Complaint:</strong>
                  <p style={{ margin: '4px 0 0' }}>{selectedRecord.complaint || 'N/A'}</p>
                </div>
                <div>
                  <strong>Clinical Observations:</strong>
                  <p style={{ margin: '4px 0 0' }}>{selectedRecord.observations || 'N/A'}</p>
                </div>
                <div>
                  <strong>Prescription Advice:</strong>
                  <p style={{ margin: '4px 0 0', color: 'var(--primary-700)', fontWeight: 500 }}>{selectedRecord.advice || 'N/A'}</p>
                </div>
                {selectedRecord.followUp && (
                  <div>
                    <strong>Follow-up Instructions:</strong>
                    <p style={{ margin: '4px 0 0' }}>{selectedRecord.followUp}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => window.print()}>
                <HiOutlinePrinter size={16} /> Print
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMedicalRecords;
