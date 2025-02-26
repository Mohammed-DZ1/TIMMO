import axios from 'axios';

// Configure API base URL
const api = axios.create({
    baseURL: '/.netlify/functions/'
});

// Add JWT token to request headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login User (Uses Environment Variables if No Credentials Provided)
export const loginUser = async (email, password) => {
    try {
        const response = await api.post('auth', { email, password });
        localStorage.setItem('token', response.data.token);
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
