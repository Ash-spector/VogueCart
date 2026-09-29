import api from './api';

export const fetchCart = () => api.get('/cart').then((r) => r.data);
export const addCartItem = (data) => api.post('/cart', data).then((r) => r.data);
export const updateCartItem = (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }).then((r) => r.data);
export const removeCartItem = (itemId) => api.delete(`/cart/${itemId}`).then((r) => r.data);
export const clearCartRequest = () => api.delete('/cart').then((r) => r.data);