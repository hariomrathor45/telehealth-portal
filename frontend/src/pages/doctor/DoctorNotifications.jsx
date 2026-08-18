import { useState, useEffect } from 'react';
import notificationApi from '../../services/notificationApi';
import { HiOutlineBell, HiOutlineCheck, HiOutlineCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DoctorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications({ limit: 40 });
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, readAt: new Date() } : n))
      );
    } catch (err) {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications read');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Clinical Alerts & Notifications</h1>
          <p>Real-time notifications for incoming patient bookings, high-priority queue alerts, and verification notices</p>
        </div>
        {notifications.some((n) => !n.readAt) && (
          <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead}>
            <HiOutlineCheckCircle size={16} /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading alerts...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <p className="empty-state-title">No Notifications</p>
            <p className="empty-state-text">You're all caught up with clinic updates.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => {
            const isUnread = !n.readAt;
            return (
              <div
                key={n._id}
                className="card"
                style={{
                  margin: 0,
                  border: isUnread ? '1px solid var(--primary-300)' : '1px solid var(--border-color)',
                  background: isUnread ? 'var(--primary-50)' : '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    className="avatar"
                    style={{
                      background: isUnread ? 'var(--primary-100)' : 'var(--slate-100)',
                      color: isUnread ? 'var(--primary-700)' : 'var(--slate-500)',
                      flexShrink: 0,
                    }}
                  >
                    <HiOutlineBell size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>{n.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--slate-600)' }}>{n.message}</p>
                    <span className="text-xs text-muted" style={{ display: 'inline-block', marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {isUnread && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleMarkRead(n._id)}
                    title="Mark as read"
                  >
                    <HiOutlineCheck size={16} /> Mark Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorNotifications;
