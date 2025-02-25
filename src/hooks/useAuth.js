import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/.netlify/functions/checkAuth', {
                withCredentials: true
            });
            
            if (response.status === 200) {
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post('/.netlify/functions/login', 
                { email, password },
                { withCredentials: true }
            );

            if (response.status === 200) {
                setUser(response.data);
                return true;
            }
            return false;
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            setError(null);
            await axios.post('/.netlify/functions/logout', {}, { withCredentials: true });
            setUser(null);
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const value = {
        user,
        loading,
        error,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    if (context.loading) {
        throw new Error('useAuth cannot be used while loading');
    }
    return context;
};

export default useAuth;
