import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return true;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Invalid token:', error);
        return true;
    }
};
