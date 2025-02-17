import { decode as jwtDecode } from 'jwt-decode'; // Updated import statement

export const isTokenExpired = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return true;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Invalid token:', error);
        return true; // If decoding fails, consider the token expired
    }
};
