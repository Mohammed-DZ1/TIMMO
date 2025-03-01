import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Enhanced token validation function
    const isTokenValid = (token) => {
        if (!token) {
            console.warn('No token provided for validation');
            return false;
        }
        
        try {
            // Attempt to decode the token
            const decoded = jwt_decode(token);
            
            // Check token expiration
            const isNotExpired = decoded.exp * 1000 > Date.now();
            
            // Optional: Additional validation checks
            if (!isNotExpired) {
                console.warn('Token has expired', {
                    expiration: new Date(decoded.exp * 1000),
                    currentTime: new Date()
                });
            }

            // You could add more checks here, like:
            // - Verify issuer
            // - Check token claims
            
            return isNotExpired;
        } catch (error) {
            console.error('Token validation failed', {
                error: error.message,
                tokenLength: token.length,
                tokenStart: token.substring(0, 10),
                tokenEnd: token.substring(token.length - 10)
            });
            return false;
        }
    };

    useEffect(() => {
        // Check for existing token on initial load
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser && isTokenValid(token)) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                // Invalid stored user, clear storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                console.error('Failed to parse stored user', error);
            }
        }
        setLoading(false);

        // Setup axios interceptor only once
        const interceptor = axios.interceptors.request.use(
            config => {
                const token = localStorage.getItem('token');
                if (token && isTokenValid(token)) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                } else {
                    // Remove invalid token
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
                return config;
            },
            error => {
                // If request fails due to authentication, logout
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptor
        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/.netlify/functions/Login', { 
                email, 
                password 
            }, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                }
            });

            // Comprehensive error handling
            if (response.status !== 200) {
                console.error('Login failed', {
                    status: response.status,
                    data: response.data,
                    headers: response.headers
                });
                return {
                    success: false,
                    error: response.data?.message || 'Login failed',
                    details: {
                        status: response.status,
                        data: response.data
                    }
                };
            }

            const { token, user } = response.data;

            // Validate token before storing
            if (!isTokenValid(token)) {
                console.error('Received invalid token', { 
                    tokenPresent: !!token,
                    tokenLength: token?.length,
                    tokenStart: token?.substring(0, 10)
                });
                return {
                    success: false,
                    error: 'Invalid authentication token',
                    details: {
                        tokenPresent: !!token,
                        tokenLength: token?.length
                    }
                };
            }

            // Store token and user in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Update current user
            setUser(user);

            return { success: true };
        } catch (error) {
            // Comprehensive error logging
            console.error('Detailed Login Error:', {
                message: error.message,
                name: error.name,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
                fullError: error,
                requestData: { email: email.replace(/./g, '*') } // Mask email
            });

            return {
                success: false,
                error: error.response?.data?.message || 
                       error.response?.data?.error?.message || 
                       error.message || 
                       'Unexpected login error',
                details: {
                    status: error.response?.status,
                    data: error.response?.data
                }
            };
        }
    };

    const logout = async () => {
        try {
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Update state
            setUser(null);

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                error: error.message || 'Logout failed'
            };
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            loading,
            isAuthenticated: !!user 
        }}>
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
