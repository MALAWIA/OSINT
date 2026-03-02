import axios from 'axios';

// Function to create API client with interceptors
const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
  });

  // Request interceptor to add authorization header
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for automatic token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token');
          }
          // Use authApi for refresh to avoid recursion
          const response = await axios.post(`${baseURL}/auth/token/refresh`, {
            refresh: refreshToken
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// API clients for different backends
export const authApi = createApiClient('http://localhost:8001/api');
export const nseApi = createApiClient('http://localhost:8000/api');

// For HTTPS in production, update baseURLs accordingly
