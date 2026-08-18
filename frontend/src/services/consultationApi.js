import api from './api';

const consultationApi = {
  startConsultation: (appointmentId) => api.post('/consultations/start', { appointmentId }),
  saveNotes: (id, data) => api.patch(`/consultations/${id}/notes`, data),
  completeConsultation: (id, data) => api.post(`/consultations/${id}/complete`, data),
  getConsultation: (id) => api.get(`/consultations/${id}`),
};

export default consultationApi;
