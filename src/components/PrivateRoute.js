import React from 'react';
import { Navigate } from 'react-router-dom';
import { decode as jwtDecode } from 'jwt-decode';

const isTokenExpired = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return true;

    try {
        const decodedToken = jwtDecode(token);
        return decodedToken.exp * 1000 < Date.now(); // Check if the token is expired
    } catch (error) {
        return true; // If decoding fails, consider token expired
    }
};

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');

    if (!token || isTokenExpired()) {
        alert('Session expired. Please log in again.');
        localStorage.clear(); // Clear session storage
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;
