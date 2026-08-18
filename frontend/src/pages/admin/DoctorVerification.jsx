import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { HiOutlineCheck, HiOutlineX, HiOutlineEye, HiOutlineFilter, HiOutlineDocumentText } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DoctorVerification = () => {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  // Inspection Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [verificationDetails, setVerificationDetails] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDoctors({ status: filter === 'ALL' ? undefined : filter });
      setDoctors(res.data?.doctors || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [filter]);

  const handleOpenInspection = async (doctor) => {
    setSelectedDoctor(doctor);
    setRemarks('');
    try {
      const res = await adminApi.getDoctorDetails(doctor._id);
      setVerificationDetails(res.data?.verification);
    } catch (err) {
      toast.error('Failed to fetch verification details');
    }
  };

  const handleApprove = async (doctorId) => {
    setActionLoading(true);
    try {
      await adminApi.approveDoctor(doctorId, remarks || 'Approved after credential review.');
      toast.success('Doctor successfully approved and activated!');
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (err) {
      toast.error(err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (doctorId) => {
    if (!remarks.trim()) {
      toast.error('Please enter a mandatory rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      await adminApi.rejectDoctor(doctorId, remarks);
      toast.success('Doctor application marked as rejected.');
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (err) {
      toast.error(err.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDocStatus = async (docIndex, newStatus) => {
    if (!selectedDoctor) return;
    try {
      await adminApi.updateDocumentStatus(selectedDoctor._id, docIndex, newStatus);
      toast.success(`Document marked as ${newStatus}`);
      const res = await adminApi.getDoctorDetails(selectedDoctor._id);
      setVerificationDetails(res.data?.verification);
    } catch (err) {
      toast.error('Failed to update document status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      case 'PENDING':
      default: return 'badge-warning';
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Doctor Credential Verification</h1>
          <p>Inspect submitted qualifications, medical registration licenses, and approve active practitioners</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-3">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All Registrations' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading verification queue...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-title">No {filter !== 'ALL' ? filter.toLowerCase() : ''} Doctors</p>
            <p className="empty-state-text">No doctor profiles found under this verification filter.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Qualification</th>
                <th>Medical Reg. No.</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id}>
                  <td>
                    <div className="font-semibold">{doc.fullName}</div>
                    <div className="text-xs text-muted">{doc.userId?.email}</div>
                  </td>
                  <td>{doc.specialization || 'General'}</td>
                  <td>{doc.qualification}</td>
                  <td className="font-mono text-xs">{doc.medicalRegistrationNumber}</td>
                  <td>{doc.experienceYears} yrs</td>
                  <td><span className={`badge ${getStatusBadge(doc.verificationStatus)}`}>{doc.verificationStatus}</span></td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenInspection(doc)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <HiOutlineEye size={14} /> Inspect & Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Verification Inspection Modal */}
      {selectedDoctor && (
        <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
          <div className="modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Doctor Credential Audit</h3>
                <p className="text-xs text-muted" style={{ margin: 0 }}>Reviewing Dr. {selectedDoctor.fullName}</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedDoctor(null)}>
                <HiOutlineX size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Doctor Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '16px',
                background: 'var(--slate-50)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                fontSize: '0.875rem',
              }}>
                <div><strong>Full Name:</strong> {selectedDoctor.fullName}</div>
                <div><strong>Email:</strong> {selectedDoctor.userId?.email}</div>
                <div><strong>Specialization:</strong> {selectedDoctor.specialization || 'General'}</div>
                <div><strong>Qualification:</strong> {selectedDoctor.qualification}</div>
                <div><strong>Medical Reg No:</strong> <span className="font-mono">{selectedDoctor.medicalRegistrationNumber}</span></div>
                <div><strong>Hospital / Clinic:</strong> {selectedDoctor.hospitalClinic || 'N/A'}</div>
                <div><strong>Experience:</strong> {selectedDoctor.experienceYears} Years</div>
                <div><strong>Consultation Fee:</strong> ₹{selectedDoctor.consultationFee || 0}</div>
              </div>

              {/* Submitted Verification Documents Checklist */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Submitted Verification Documents</h4>
                {verificationDetails?.submittedDocuments?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {verificationDetails.submittedDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <HiOutlineDocumentText size={18} color="var(--primary-600)" />
                          <div>
                            <div className="text-sm font-medium">{doc.originalName || doc.documentType}</div>
                            <div className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>
                              Type: {doc.documentType.replace('_', ' ')}
                            </div>
                          </div>
                        </div>

                        {/* Document Verification Status Selector */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {['VERIFIED', 'NEEDS_REVIEW', 'NOT_VERIFIED'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              className={`btn btn-sm ${doc.documentStatus === st ? (st === 'VERIFIED' ? 'btn-success' : 'btn-danger') : 'btn-outline'}`}
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => handleUpdateDocStatus(idx, st)}
                            >
                              {st === 'VERIFIED' ? '✓ Valid' : st === 'NEEDS_REVIEW' ? '? Review' : '✗ Invalid'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted" style={{ padding: '10px', background: 'var(--slate-50)', borderRadius: '4px' }}>
                    Self-declaration documents attached to registration.
                  </div>
                )}
              </div>

              {/* Administrative Remarks Input */}
              <div className="form-group">
                <label className="form-label">
                  Audit Remarks {selectedDoctor.verificationStatus !== 'APPROVED' && '<span class="text-danger">*</span>'}
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Enter audit notes or mandatory rejection reason..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedDoctor(null)}>
                Cancel
              </button>
              {selectedDoctor.verificationStatus !== 'REJECTED' && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleReject(selectedDoctor._id)}
                  disabled={actionLoading}
                >
                  <HiOutlineX size={16} /> Reject Application
                </button>
              )}
              {selectedDoctor.verificationStatus !== 'APPROVED' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleApprove(selectedDoctor._id)}
                  disabled={actionLoading}
                >
                  <HiOutlineCheck size={16} /> Approve & Activate Doctor
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorVerification;
