import axios from 'axios';

// Set base URL for Axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Request Interceptor
axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);