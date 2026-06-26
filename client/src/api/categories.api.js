import api from './axios.js';

export const categoriesApi = {
  getAll: ()           => api.get('/categories'),
  getById: (id)        => api.get(`/categories/${id}`),
  create: (data)       => api.post('/categories', data),
  update: (id, data)   => api.put(`/categories/${id}`, data),
  remove: (id)         => api.delete(`/categories/${id}`),
};
