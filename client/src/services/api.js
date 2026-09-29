import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('voguecart_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Friendly error messages + auto-logout on an expired token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('voguecart_token')) {
      window.dispatchEvent(new Event('auth:logout'));
    }
    err.userMessage =
      err.response?.data?.message ||
      (err.request ? 'Network error. Please check your connection.' : 'Something went wrong.');
    return Promise.reject(err);
  }
);

export default api;