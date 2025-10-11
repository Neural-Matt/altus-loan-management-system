import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export const http = axios.create({ baseURL });

http.interceptors.request.use(config => {
  const token = process.env.REACT_APP_API_TOKEN; // later: dynamic token refresh
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  r => r,
  error => {
    // Standardize error shape
    const message = error.response?.data?.message || error.message || 'Unexpected error';
    return Promise.reject({
      status: error.response?.status,
      message,
      raw: error
    });
  }
);
