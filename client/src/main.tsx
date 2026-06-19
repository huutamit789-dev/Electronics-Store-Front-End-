import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-free/js/all.min.js'; // Giữ lại nếu cần cho các chức năng JS của FA

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './utils/axiosConfig';
import './assets/templateAdmin/css/sb-admin-2.css'
import './assets/templateAdmin/css/sb-admin-2.min.css'
import './assets/templateAdmin/vendor/fontawesome-free/css/all.min.css'
import './index.css'
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);