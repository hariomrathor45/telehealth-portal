import { useState, useEffect } from 'react';
import medicalRecordApi from '../../services/medicalRecordApi';
import { HiOutlineDocumentText, HiOutlineSearch, HiOutlinePrinter, HiOutlineX, HiOutlineEye } from 'react-icons/hi';
import { FaUserMd, FaHeartbeat } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PatientMedicalRecords = () => {
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
        toast.error('Failed to load medical records');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.doctorId?.fullName?.toLowerCase().includes(term) ||
      r.complaint?.toLowerCase().includes(term) ||
      r.observations?.toLowerCase().includes(term) ||
      r.advice?.toLowerCase().includes(term)
    );
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Medical Records & Prescriptions</h1>
          <p>Access your past consultation summaries, doctor observations, and prescription advice</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="card mb-3" style={{ padding: '14px 20px' }}>
        <div className="form-input-icon">
          <span className="icon"><HiOutlineSearch /></span>
          <input
            type="text"
            className="form-input"
            placeholder="Search records by doctor name, diagnosis, advice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading your medical records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-title">No Medical Records Found</p>
            <p className="empty-state-text">
              {search ? 'No records match your search query.' : 'Completed doctor consultations will automatically generate records here.'}
            </p>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="avatar" style={{ background: 'var(--success-light)', color: 'var(--success-dark)' }}>
                      <HiOutlineDocumentText size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>{rec.doctorId?.fullName}</h4>
                      <div className="text-xs text-muted">{rec.doctorId?.specialization || 'Consultant'}</div>
                    </div>
                  </div>
                  <span className="badge badge-neutral text-xs">
                    {new Date(rec.recordDate).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)', lineHeight: 1.6, marginBottom: '14px' }}>
                  {rec.complaint && (
                    <div style={{ marginBottom: 6 }}>
                      <strong className="text-muted text-xs">Chief Complaint:</strong>
                      <div style={{ fontWeight: 500 }}>{rec.complaint}</div>
                    </div>
                  )}

                  {rec.observations && (
                    <div style={{ marginBottom: 6 }}>
                      <strong className="text-muted text-xs">Doctor Observations:</strong>
                      <div style={{ color: 'var(--slate-600)' }}>{rec.observations}</div>
                    </div>
                  )}

                  {rec.advice && (
                    <div>
                      <strong className="text-muted text-xs">Prescription & Advice:</strong>
                      <div style={{ color: 'var(--primary-700)', fontWeight: 500 }}>{rec.advice}</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
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

      {/* Record Detail & Print Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaHeartbeat color="var(--primary-600)" size={20} />
                <div>
                  <h3 style={{ margin: 0 }}>Consultation Medical Summary</h3>
                  <p className="text-xs text-muted" style={{ margin: 0 }}>TeleHealth Electronic Health Record</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedRecord(null)}>
                <HiOutlineX size={18} />
              </button>
            </div>

            <div className="modal-body print-area">
              {/* Doctor details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '14px',
                background: 'var(--slate-50)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
              }}>
                <div>
                  <div className="text-xs text-muted">Consulting Doctor</div>
                  <div className="font-semibold">{selectedRecord.doctorId?.fullName}</div>
                  <div className="text-xs text-muted">{selectedRecord.doctorId?.qualification}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Consultation Date</div>
                  <div className="font-semibold">{new Date(selectedRecord.recordDate).toLocaleDateString()}</div>
                  <div className="text-xs text-muted">{selectedRecord.doctorId?.hospitalClinic || 'TeleHealth Network'}</div>
                </div>
              </div>

              {/* Clinical sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
                <div>
                  <h4 className="text-xs text-muted font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Patient Reported Complaint
                  </h4>
                  <div style={{ padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
                    {selectedRecord.complaint || 'General consultation request'}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-muted font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Doctor's Observations & Findings
                  </h4>
                  <div style={{ padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
                    {selectedRecord.observations || 'Patient assessed via telehealth session.'}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-muted font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Rx Advice & Treatment Plan
                  </h4>
                  <div style={{ padding: '12px', background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-sm)', color: 'var(--primary-700)', fontWeight: 500 }}>
                    {selectedRecord.advice || 'Follow general healthy habits.'}
                  </div>
                </div>

                {selectedRecord.followUp && (
                  <div>
                    <h4 className="text-xs text-muted font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      Follow-up Guidance
                    </h4>
                    <div style={{ padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
                      {selectedRecord.followUp}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlinePrinter size={16} /> Print / Save PDF
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

export default PatientMedicalRecords;
