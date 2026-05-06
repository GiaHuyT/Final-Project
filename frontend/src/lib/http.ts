import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

const http = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Crucial for sending/receiving cookies
});

// Request Interceptor: Attach Access Token
http.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Match the key used in login page
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle Refresh Logic
http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 and we haven't retried yet
        // Don't retry for login or refresh-token endpoints
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/refresh-token')
        ) {
            originalRequest._retry = true;

            try {
                // Call refresh token API
                const res = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
                    withCredentials: true
                });

                const { accessToken } = res.data;
                localStorage.setItem('token', accessToken);
                Cookies.set('token', accessToken); // Cập nhật cả Cookie cho Middleware

                // Update header and retry original request
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return http(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear everything and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                Cookies.remove('token', { path: '/' }); 
                Cookies.remove('user_role', { path: '/' });

                // Show a friendly message if possible (optional, but alert is certain)
                toast.error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default http;
