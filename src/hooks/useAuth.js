import { useEffect, useState } from 'react';
import axios from 'axios';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to authenticate with backend
    const checkAuth = async () => {
        try {
            const response = await axios.get('/.netlify/functions/checkAuth', { withCredentials: true });

            if (response.status === 200) {
                setUser(response.data.email);
                setRole(response.data.role);
            } else {
                setUser(null);
                setRole(null);
            }
        } catch (error) {
            setUser(null);
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/.netlify/functions/login', { email, password }, { withCredentials: true });

            if (response.status === 200) {
                setUser(response.data.email);
                setRole(response.data.role);
                return true;
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
        return false;
    };

    const logout = async () => {
        try {
            await axios.post('/.netlify/functions/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            setRole(null);
        }
    };

    return { user, role, login, logout, loading };
};

export default useAuth;
