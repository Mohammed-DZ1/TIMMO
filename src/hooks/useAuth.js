import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_BASE_URL = 'https://timmodashboard.netlify.app';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_BASE_URL}/.netlify/functions/checkAuth`, {
                    withCredentials: true
                });
                
                if (response.data && response.data.user) {
                    setUser({
                        email: response.data.user.email,
                        role: response.data.user.role || 'user'
                    });
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                setUser(null);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(`${API_BASE_URL}/.netlify/functions/login`, 
                { email, password },
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data && response.data.user) {
                setUser({
                    email: response.data.user.email,
                    role: response.data.user.role || 'user'
                });
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            setError(null);
            await axios.post(`${API_BASE_URL}/.netlify/functions/logout`, {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setUser(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user: user || null,
        loading,
        error,
        login,
        logout
    };

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
