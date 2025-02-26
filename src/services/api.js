import axios from 'axios';

// Configure API base URL
const api = axios.create({
    baseURL: '/.netlify/functions',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Login User
export const loginUser = async (email, password) => {
    return api.post('/Login', { email, password });
};

// Check Auth
export const checkAuth = async () => {
    return api.get('/checkAuth');
};

// Logout User
export const logoutUser = async () => {
    return api.post('/logout');
};

export default api;
