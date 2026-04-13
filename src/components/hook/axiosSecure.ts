import axios from 'axios';
import Cookies from 'js-cookie';

const axiosSecure = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://10.10.7.106:5001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers
axiosSecure.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401/403 errors
axiosSecure.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // 401 = token missing or expired → logout
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      // 403 = authenticated but insufficient role → do NOT logout,
      // let the caller handle the error with a toast/message
    }
    return Promise.reject(error);
  }
);

export default axiosSecure;
