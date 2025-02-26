import axios from 'axios';
import Cookies from 'js-cookie';

// Configure API base URL
const api = axios.create({
    baseURL: 'https://timmodashboard.netlify.app/.netlify/functions/',
    withCredentials: true
});

// Add Authorization header from cookie
api.interceptors.request.use(config => {
    const token = Cookies.get('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.withCredentials = true;
    return config;
});

// Login User
export const loginUser = async (email, password) => {
    try {
        const response = await api.post('auth', { email, password });
        // Set the token in a cookie that will be included in all requests
        Cookies.set('authToken', response.data.token, { 
            secure: true,
            sameSite: 'strict',
            path: '/'
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

// Fetch Dashboard Stats
export const getDashboardStats = async () => {
    try {
        const response = await api.get('getDashboardStats');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw new Error(error.response?.data?.message || 'Failed to load dashboard data');
    }
};

export default api;
