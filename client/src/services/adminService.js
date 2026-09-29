import api from './api';

export const getStats = () => api.get('/admin/stats').then((r) => r.data);
export const getAllOrders = (status) =>
  api.get('/orders', { params: status && status !== 'All' ? { status } : {} }).then((r) => r.data);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status }).then((r) => r.data);
export const getUsers = () => api.get('/users').then((r) => r.data);

export const createProduct = (data) => api.post('/products', data).then((r) => r.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);