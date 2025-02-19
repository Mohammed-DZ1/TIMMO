import jwtDecode from 'jwt-decode';

export const isTokenExpired = () => {
    const token = sessionStorage.getItem('authToken');
    const tokenExpiry = sessionStorage.getItem('tokenExpiry');

    if (!token || !tokenExpiry) return true; //  No token or missing expiry = expired session

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now();

        return currentTime >= parseInt(tokenExpiry); //  Compare against stored expiry timestamp
    } catch (error) {
        console.error('Invalid token:', error);
        return true; //  Treat decoding errors as expired
    }
};