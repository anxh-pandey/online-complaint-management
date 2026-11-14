import axios from 'axios';

// Uses the Vite proxy ("/api") in development, or VITE_API_URL if provided.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token expired or is invalid, clear the session and go to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Turn any error into a friendly message for toasts / forms
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Cannot reach the server. Please make sure the backend is running.';
  }
  return error.message || 'Something went wrong';
};

// Build a full URL for an uploaded image path such as "/uploads/abc.png"
export const imageUrl = (path) => (path ? `${import.meta.env.VITE_FILE_URL || ''}${path}` : '');

export default api;
