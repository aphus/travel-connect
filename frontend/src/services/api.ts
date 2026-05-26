import axios from 'axios';

// Khởi tạo instance với URL mặc định từ biến môi trường
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: Tự động nhét JWT Token vào header trước khi gửi API
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (chỉ chạy trên Client)
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
      console.error("Unauthorized! Token không hợp lệ hoặc đã hết hạn.");

      // Đảm bảo chỉ thực thi trên môi trường Client
      if (typeof window !== 'undefined') {
        // Xóa Token lỗi/hết hạn ra khỏi bộ nhớ
        localStorage.removeItem('accessToken');

        // Điều hướng thẳng về trang Login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;