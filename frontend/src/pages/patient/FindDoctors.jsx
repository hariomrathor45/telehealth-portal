import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import doctorApi from '../../services/doctorApi';
import authService from '../../services/authService';
import appointmentApi from '../../services/appointmentApi';
import { HiOutlineSearch, HiOutlineCalendar, HiOutlineClock, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';
import { FaUserMd } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const FindDoctors = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const linkedConcernId = searchParams.get('concern') || null;
  const linkedAssessmentId = searchParams.get('assessment') || null;
  const preselectedDoctorId = searchParams.get('book') || null;

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [maxFee, setMaxFee] = useState('');

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('10:00');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getApprovedDoctors({
        search,
        specialization: selectedSpecialization || undefined,
        maxFee: maxFee || undefined,
      });
      setDoctors(res.data?.doctors || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const res = await authService.getSpecializations();
        setSpecializations(res.data || []);
      } catch (err) {
        console.warn('Specializations load error:', err);
      }
    };
    loadSpecializations();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialization]);

  // Preselect doctor if passed in query param
  useEffect(() => {
    if (preselectedDoctorId && doctors.length > 0) {
      const match = doctors.find(d => d._id === preselectedDoctorId);
      if (match) setSelectedDoctor(match);
    }
  }, [preselectedDoctorId, doctors]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !bookingDate || !bookingTime) {
      toast.error('Please select doctor, appointment date, and time slot.');
      return;
    }

    setBookingLoading(true);
    try {
      await appointmentApi.bookAppointment({
        doctorId: selectedDoctor._id,
        appointmentDate: bookingDate,
        startTime: bookingTime,
        healthConcernId: linkedConcernId,
        priorityAssessmentId: linkedAssessmentId,
        notes: bookingNotes,
      });

      toast.success(`Appointment confirmed with ${selectedDoctor.fullName}!`);
      setSelectedDoctor(null);
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Find & Book Approved Specialists</h1>
          <p>Search credential-verified doctors and schedule immediate or priority consultations</p>
        </div>
      </div>

      {linkedAssessmentId && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span className="text-sm font-medium" style={{ color: 'var(--primary-800)' }}>
            ✨ Booking with evaluated Priority Triage Assessment
          </span>
          <span className="badge badge-primary">Priority Active</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card mb-3" style={{ padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr auto', gap: '12px', alignItems: 'center' }}>
          <div className="form-input-icon">
            <span className="icon"><HiOutlineSearch /></span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by doctor name, hospital, qualification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec._id || spec.name} value={spec.name}>
                {spec.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="form-input"
            placeholder="Max Fee (₹)"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            min="0"
          />

          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading verified specialists...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👨‍⚕️</div>
            <p className="empty-state-title">No Doctors Found</p>
            <p className="empty-state-text">No approved doctors matched your current search filters.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                margin: 0,
                border: '1px solid var(--border-color)',
                transition: 'all 200ms ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div className="avatar avatar-lg" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', fontSize: '1.25rem' }}>
                    {doc.fullName?.[0] || 'D'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', margin: '0 0 2px' }}>{doc.fullName}</h3>
                    <div className="text-xs text-muted" style={{ fontWeight: 500 }}>{doc.qualification}</div>
                    <span className="badge badge-info" style={{ marginTop: '6px' }}>
                      {doc.specialization || 'General Medicine'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.6, marginBottom: '14px' }}>
                  <div>🏥 <strong>Hospital:</strong> {doc.hospitalClinic || 'TeleHealth Partner'}</div>
                  <div>⏱️ <strong>Experience:</strong> {doc.experienceYears} Years</div>
                  <div>📜 <strong>Reg. No:</strong> <span className="font-mono text-xs">{doc.medicalRegistrationNumber}</span></div>
                </div>

                {doc.bio && (
                  <p className="text-xs text-muted" style={{
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: '16px',
                  }}>
                    {doc.bio}
                  </p>
                )}
              </div>

              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div className="text-xs text-muted">Consultation Fee</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                    ₹{doc.consultationFee || 0}
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedDoctor(doc)}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Booking Modal */}
      {selectedDoctor && (
        <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Book Appointment</h3>
                <p className="text-xs text-muted" style={{ margin: 0 }}>With {selectedDoctor.fullName} ({selectedDoctor.specialization})</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedDoctor(null)}>
                <HiOutlineX size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Date *</label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Available Time Slots *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = bookingTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setBookingTime(slot)}
                        style={{ padding: '8px 4px', fontSize: '0.85rem' }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Brief Note for Doctor (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Any specific symptoms or medication notes..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedDoctor(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDoctors;
