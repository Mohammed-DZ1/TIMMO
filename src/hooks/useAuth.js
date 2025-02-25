import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_BASE_URL = 'https://timmodashboard.netlify.app';

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState({
        user: null,
        loading: true,
        error: null
    });

    const checkAuth = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const response = await axios.get(`${API_BASE_URL}/.netlify/functions/checkAuth`, {
                withCredentials: true
            });
            
            if (response.data?.user) {
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

    useEffect(() => {
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
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data?.user) {
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
            await axios.post(
                `${API_BASE_URL}/.netlify/functions/logout`,
                {},
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
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

    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                loading: state.loading,
                error: state.error,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default useAuth;
