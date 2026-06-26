import api from './axios.js';

export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((d) => d.data),

  getMe: (token) =>
    api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((d) => d.data),
};
