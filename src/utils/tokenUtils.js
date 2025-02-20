import jwtDecode from 'jwt-decode';

export const isTokenExpired = () => {
    const token = sessionStorage.getItem('authToken');
    const tokenExpiry = sessionStorage.getItem('tokenExpiry');

    if (!token || !tokenExpiry) {
        console.warn("expiry found. Expiring session.");
        return true;
    }

    try {
        const currentTime = Date.now();
        return currentTime >= parseInt(tokenExpiry, 10); 
    } catch (error) {
        console.error('Invalid token:', error);
        return true; 
    }
};
