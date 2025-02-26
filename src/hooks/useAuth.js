import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [state, setState] = useState({
        user: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));
                const response = await api.get('checkAuth', {
                    withCredentials: true
                });
                
                if (response.data && response.data.user) {
                    setState(prev => ({
                        ...prev,
                        user: {
                            email: response.data.user.email,
                            role: response.data.user.role || 'user'
                        },
                        loading: false
                    }));
                } else {
                    setState(prev => ({ ...prev, user: null, loading: false }));
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                setState(prev => ({
                    ...prev,
                    user: null,
                    loading: false,
                    error: err.message
                }));
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const response = await api.post('login', { email, password });

            if (response.data && response.data.user) {
                // Set the auth token cookie
                if (response.data.token) {
                    Cookies.set('authToken', response.data.token, { 
                        secure: true,
                        sameSite: 'strict',
                        path: '/'
                    });
                }

                setState(prev => ({
                    ...prev,
                    user: {
                        email: response.data.user.email,
                        role: response.data.user.role || 'user'
                    },
                    loading: false
                }));
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (err) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: err.response?.data?.message || err.message
            }));
            throw err;
        }
    };

    const logout = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            await api.post('logout');
            // Remove the auth token cookie
            Cookies.remove('authToken', { path: '/' });
            setState(prev => ({ ...prev, user: null, loading: false }));
        } catch (err) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: err.response?.data?.message || err.message
            }));
            throw err;
        }
    };

    const value = {
        user: state.user,
        loading: state.loading,
        error: state.error,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthProvider };
export default useAuth;
