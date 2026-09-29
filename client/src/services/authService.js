import api from './api';

export const loginUser = (data) => api.post('/auth/login', data).then((r) => r.data);
export const registerUser = (data) => api.post('/auth/register', data).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
export const getProfile = () => api.get('/users/profile').then((r) => r.data);
export const updateProfile = (data) => api.put('/users/profile', data).then((r) => r.data);