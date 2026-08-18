import api from './api';

const priorityApi = {
  assessHealthConcern: (data) => api.post('/priority/assess', data),
  getAssessmentDetails: (id) => api.get(`/priority/${id}`),
};

export default priorityApi;
