import axios from 'axios';

// Khởi tạo instance với URL mặc định từ biến môi trường
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: Tự động nhét JWT Token vào header trước khi gửi API
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Bắt lỗi toàn cục
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Logic xử lý khi Token hết hạn hoặc không hợp lệ (VD: Điều hướng về trang Login)
      console.error("Unauthorized! Token không hợp lệ hoặc đã hết hạn.");
    }
    return Promise.reject(error);
  }
);

export default api;