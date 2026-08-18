import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { HiOutlineClipboardList, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getAuditLogs({ limit: 50 });
        setLogs(res.data?.logs || []);
      } catch (err) {
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Immutable Administrative Audit Trail</h1>
          <p>Chronological security logs of all doctor verifications, role updates, and system decisions</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-title">No Audit Logs Yet</p>
            <p className="empty-state-text">Administrative approvals, rejections, and state changes will be recorded here.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Administrator</th>
                <th>Action Performed</th>
                <th>Target Type</th>
                <th>Remarks / Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="text-xs font-mono text-muted">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="font-semibold text-xs">{log.adminId?.email || 'System'}</td>
                  <td>
                    <span className={`badge ${
                      log.action.includes('APPROVED') ? 'badge-success' :
                      log.action.includes('REJECTED') ? 'badge-danger' : 'badge-info'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="text-xs" style={{ textTransform: 'capitalize' }}>
                    {log.targetType || 'System'}
                  </td>
                  <td className="text-xs text-secondary" style={{ maxWidth: '320px' }}>
                    {log.remarks || 'Standard operation completed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
