import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { HiOutlineChartBar, HiOutlineSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminApi.getAnalytics();
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Generating analytics metrics...</p>
      </div>
    );
  }

  const priorityDist = data?.priorityDistribution || [];
  const specializationStats = data?.specializationStats || [];
  const appointmentStats = data?.appointmentStatusStats || [];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Clinical Intelligence & Platform Analytics</h1>
          <p>Triage urgency distribution, specialization demand, and consultation completion metrics</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Priority Triage Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Priority Triage Breakdown</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {priorityDist.length === 0 ? (
              <p className="text-xs text-muted">No triage data recorded yet.</p>
            ) : (
              priorityDist.map((item) => (
                <div key={item._id || 'unassigned'} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${
                    item._id === 'VERY_HIGH' ? 'badge-danger' :
                    item._id === 'HIGH' ? 'badge-warning' :
                    item._id === 'MEDIUM' ? 'badge-info' : 'badge-neutral'
                  }`}>
                    {item._id || 'LOW'} Priority
                  </span>
                  <span className="font-bold text-sm">{item.count} Cases</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Consultation Statuses */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Consultation Status Breakdown</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {appointmentStats.length === 0 ? (
              <p className="text-xs text-muted">No appointments recorded yet.</p>
            ) : (
              appointmentStats.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-sm font-medium">{item._id}</span>
                  <span className="badge badge-info">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Specialization Distribution */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Specialization Distribution</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          {specializationStats.map((spec) => (
            <div
              key={spec._id || 'General'}
              style={{
                padding: '14px',
                background: 'var(--slate-50)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span className="text-sm font-medium">{spec._id || 'General Medicine'}</span>
              <span className="badge badge-primary">{spec.count} Doctors</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
