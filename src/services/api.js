import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000,
  // Add withCredentials for cookies if needed
  withCredentials: true
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.'
      });
    }

    // Server error
    if (error.response.status >= 500) {
      console.error('Server error:', error);
      return Promise.reject({
        message: 'Server error. Please try again later.'
      });
    }

    // Unauthorized error
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject({
        message: 'Session expired. Please login again.'
      });
    }

    // Other client errors
    return Promise.reject(error.response.data);
  }
);

// Auth endpoints
export const auth = {
  login: (credentials) => api.post('/auth/signin', credentials),
  register: (userData) => api.post('/auth/signup', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  logout: () => {
    localStorage.removeItem('token');
    return api.post('/auth/logout');
  },
};

// Stock endpoints
export const stocks = {
  getAll: () => api.get('/stocks'),
  getOne: (id) => api.get(`/stocks/${id}`),
  search: (query) => api.get(`/stocks/search?q=${query}`),
};

// Transaction endpoints
export const transactions = {
  getAll: () => api.get('/transactions'),
  buy: (data) => api.post('/transactions/buy', data),
  sell: (data) => api.post('/transactions/sell', data),
  getPortfolio: () => api.get('/transactions/portfolio'),
};

// Watchlist endpoints
export const watchlist = {
  getAll: () => api.get('/watchlist'),
  add: (stockId) => api.post('/watchlist', { stockId }),
  remove: (stockId) => api.delete(`/watchlist/${stockId}`),
};

// User endpoints
export const user = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export default api; 