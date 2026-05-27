import axios from 'axios';
import { clearAccessToken, getAccessToken } from './fetchWrapper';

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
    const token = getAccessToken();

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
      console.error("Unauthorized! Token không hợp lệ hoặc đã hết hạn.");

      // Đảm bảo chỉ thực thi trên môi trường Client
      if (typeof window !== 'undefined') {
        // Xóa Token lỗi/hết hạn ra khỏi bộ nhớ
        clearAccessToken();

        // Điều hướng thẳng về trang Login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
