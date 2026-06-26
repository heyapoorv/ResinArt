import api from './axios.js';

export const settingsApi = {
  get: ()              => api.get('/settings'),
  update: (formData)   => api.put('/settings', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
