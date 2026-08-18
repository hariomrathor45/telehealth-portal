import { useState, useEffect } from 'react';
import doctorApi from '../../services/doctorApi';
import { HiOutlineClock, HiOutlineSave, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DoctorAvailability = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await doctorApi.getAvailability();
        const existing = res.data || [];

        // Build default 7 days if empty
        const defaultSchedule = DAYS.map((_, index) => {
          const found = existing.find((e) => e.dayOfWeek === index);
          return (
            found || {
              dayOfWeek: index,
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: index >= 1 && index <= 5, // Mon-Fri default
            }
          );
        });

        setSchedule(defaultSchedule);
      } catch (err) {
        toast.error('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const handleToggleDay = (dayIndex) => {
    setSchedule((prev) =>
      prev.map((s) => (s.dayOfWeek === dayIndex ? { ...s, isAvailable: !s.isAvailable } : s))
    );
  };

  const handleTimeChange = (dayIndex, field, value) => {
    setSchedule((prev) =>
      prev.map((s) => (s.dayOfWeek === dayIndex ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorApi.updateAvailability(schedule);
      toast.success('Consultation availability schedule updated!');
    } catch (err) {
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Consultation Availability & Working Hours</h1>
          <p>Configure weekly days and time slots during which patients can schedule appointments</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <HiOutlineSave size={16} /> {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        {DAYS.map((dayName, dayIndex) => {
          const dayConfig = schedule.find((s) => s.dayOfWeek === dayIndex) || {
            dayOfWeek: dayIndex,
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: false,
          };

          return (
            <div
              key={dayIndex}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom: dayIndex < 6 ? '1px solid var(--border-color)' : 'none',
                opacity: dayConfig.isAvailable ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '180px' }}>
                <input
                  type="checkbox"
                  checked={dayConfig.isAvailable}
                  onChange={() => handleToggleDay(dayIndex)}
                  id={`day-${dayIndex}`}
                  style={{ width: 18, height: 18 }}
                />
                <label htmlFor={`day-${dayIndex}`} className="font-semibold text-sm" style={{ cursor: 'pointer' }}>
                  {dayName}
                </label>
              </div>

              {dayConfig.isAvailable ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="text-xs text-muted">From</span>
                    <input
                      type="time"
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={dayConfig.startTime}
                      onChange={(e) => handleTimeChange(dayIndex, 'startTime', e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="text-xs text-muted">To</span>
                    <input
                      type="time"
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={dayConfig.endTime}
                      onChange={(e) => handleTimeChange(dayIndex, 'endTime', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs text-muted font-medium">Unavailable</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorAvailability;
