import axios from 'axios';

const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  console.log('Axios Interceptors configured for development environment.');
}

// Request Interceptor
axios.interceptors.request.use(
  (config) => {
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
axios.interceptors.response.use(
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