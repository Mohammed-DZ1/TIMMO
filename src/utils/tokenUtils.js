import jwtDecode from 'jwt-decode';

export const isTokenExpired = () => {
    const token = sessionStorage.getItem('authToken');
    const tokenExpiry = sessionStorage.getItem('tokenExpiry');

    if (!token || !tokenExpiry) return true;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now();

        return currentTime >= parseInt(tokenExpiry);
    } catch (error) {
        console.error('Invalid token:', error);
        return true;
    }
};