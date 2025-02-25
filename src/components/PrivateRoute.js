import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    return user ? children : <Navigate to="/Login" replace />;
};

export default PrivateRoute;
