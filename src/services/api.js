import axios from 'axios';

// Configure API base URL
const api = axios.create({
    baseURL: 'https://timmodashboard.netlify.app/.netlify/functions/',
    withCredentials: true
});

// Add JWT token to request headers
api.interceptors.request.use(config => {
    // Remove token handling from localStorage
    config.withCredentials = true;
    return config;
});

// Login User
export const loginUser = async (email, password) => {
    try {
        const response = await api.post('auth', { email, password });
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
