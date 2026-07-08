/**
 * Axios Client Configuration
 * Cấu hình axios client với interceptors cho request và response
 */

import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8091/api';
const isDevelopment = import.meta.env.DEV;

// Create axios instance
const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isDevelopment) {
      console.groupCollapsed(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Method:', config.method?.toUpperCase());
      console.log('URL:', config.url);
      if (config.data) console.log('Data:', config.data);
      if (config.params) console.log('Params:', config.params);
      console.log('Headers:', config.headers);
      console.groupEnd();
    }

    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.groupCollapsed('❌ API Request Error');
      console.error('Error:', error.message);
      console.groupEnd();
    }
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.groupCollapsed(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
      console.log('Status:', response.status);
      console.log('URL:', response.config.url);
      console.log('Data:', response.data);
      console.groupEnd();
    }
    return response;
  },
  (error) => {
    if (isDevelopment) {
      console.groupCollapsed(`❌ API Response Error: ${error.response?.status || 'N/A'} ${error.config?.method?.toUpperCase() || 'N/A'} ${error.config?.url || 'N/A'}`);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('URL:', error.config?.url);
        console.error('Data:', error.response.data);
      } else if (error.request) {
        console.error('No Response Received:', error.request);
      } else {
        console.error('Error Message:', error.message);
      }
      console.groupEnd();
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
