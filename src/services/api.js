import axios from 'axios';

const api = axios.create({
    baseURL: '/.netlify/functions/'
});

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('auth', { email, password });
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Login failed');
    }
};
