import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenExpired } from '../utils/tokenUtils';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    if (!token || isTokenExpired()) {
        alert('Session expired. Please log in again.');
        localStorage.clear();  // Clear any stored session
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;