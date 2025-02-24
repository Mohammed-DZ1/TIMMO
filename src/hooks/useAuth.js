import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to authenticate with backend
    const checkAuth = useCallback(async () => {
        try {
            setError(null);
            const response = await axios.get('/.netlify/functions/checkAuth', {
                withCredentials: true,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (response.status === 200) {
                setUser(response.data.email);
                setRole(response.data.role);
                return true;
            }
        } catch (error) {
            // Only set error for non-401 responses
            if (error.response?.status !== 401) {
                setError(error.response?.data?.message || 'Authentication failed');
            }
            setUser(null);
            setRole(null);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Set up periodic token refresh
    useEffect(() => {
        let refreshInterval;

        if (user) {
            // Check auth status every 5 minutes
            refreshInterval = setInterval(checkAuth, 5 * 60 * 1000);
        }

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [user, checkAuth]);

    // Initial auth check
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            
            const response = await axios.post('/.netlify/functions/login', 
                { email, password },
                { 
                    withCredentials: true,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                }
            );

            if (response.status === 200) {
                setUser(response.data.email);
                setRole(response.data.role);
                return true;
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
            console.error('Login failed:', error.response?.data || error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await axios.post('/.netlify/functions/logout', {}, { 
                withCredentials: true,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setRole(null);
            setLoading(false);
            // Clear any cached requests
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
    };

    return {
        user,
        role,
        loading,
        error,
        login,
        logout,
        checkAuth
    };
};

export default useAuth;
