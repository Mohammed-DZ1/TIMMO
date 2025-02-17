import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenExpired } from '../utils/tokenUtils';

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
