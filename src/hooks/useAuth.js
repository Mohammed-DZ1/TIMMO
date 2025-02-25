import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_BASE_URL = 'https://timmodashboard.netlify.app';

const initialState = {
    user: null,
    loading: true,
    error: null
};

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState(initialState);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));
                const response = await axios.get(`${API_BASE_URL}/.netlify/functions/checkAuth`, {
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
            const response = await axios.post(
                `${API_BASE_URL}/.netlify/functions/login`,
                { email, password },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.user) {
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
            const errorMessage = err.response?.data?.message || err.message;
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
            throw err;
        }
    };

    const logout = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            await axios.post(
                `${API_BASE_URL}/.netlify/functions/logout`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            setState(prev => ({ ...prev, user: null, loading: false }));
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
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

    if (state.loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-secondary-500">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default useAuth;
