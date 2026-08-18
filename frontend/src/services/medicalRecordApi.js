import api from './api';

const medicalRecordApi = {
  getMyRecords: () => api.get('/medical-records'),
  getRecordById: (id) => api.get(`/medical-records/${id}`),
};

export default medicalRecordApi;
