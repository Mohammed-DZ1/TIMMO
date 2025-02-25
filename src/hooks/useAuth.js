import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const response = await axios.get('/.netlify/functions/checkAuth', {
                withCredentials: true
            });
            
            if (response.status === 200) {
                setUser(response.data);
                return true;
            }
            return false;
        } catch (error) {
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await axios.post('/.netlify/functions/login', 
                { email, password },
                { withCredentials: true }
            );

            if (response.status === 200) {
                await checkAuth();
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/.netlify/functions/logout', {}, { withCredentials: true });
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const value = {
        user,
        loading,
        login,
        logout,
        checkAuth
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
    return context;
};

export default useAuth;
