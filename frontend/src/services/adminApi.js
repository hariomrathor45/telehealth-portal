import api from './api';

const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getDoctors: (params) => api.get('/admin/doctors', { params }),
  getDoctorDetails: (id) => api.get(`/admin/doctors/${id}`),
  updateDocumentStatus: (id, docIndex, status) => api.patch(`/admin/doctors/${id}/document-status`, { docIndex, status }),
  approveDoctor: (id, remarks) => api.post(`/admin/doctors/${id}/approve`, { remarks }),
  rejectDoctor: (id, remarks) => api.post(`/admin/doctors/${id}/reject`, { remarks }),
  toggleDoctorStatus: (id, status, remarks) => api.patch(`/admin/doctors/${id}/status`, { status, remarks }),
  getPatients: (params) => api.get('/admin/patients', { params }),
  togglePatientStatus: (id, status, remarks) => api.patch(`/admin/patients/${id}/status`, { status, remarks }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
};

export default adminApi;
