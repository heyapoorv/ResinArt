import api from './axios.js';

export const productsApi = {
  // Public
  getAll: (params)     => api.get('/products', { params }),
  getFeatured: ()      => api.get('/products/featured'),
  search: (params)     => api.get('/products/search', { params }),
  getByCategory: (slug, params) => api.get(`/products/category/${slug}`, { params }),
  getById: (id)        => api.get(`/products/${id}`),
  getStats: ()         => api.get('/products/stats'),

  // Admin (protected – token attached by interceptor)
  create: (formData)   => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id)         => api.delete(`/products/${id}`),
};
