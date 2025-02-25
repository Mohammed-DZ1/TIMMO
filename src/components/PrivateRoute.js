import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth as authHook } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
    const { user, loading } = authHook();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;
