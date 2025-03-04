import { useState, useEffect, createContext, useContext } from 'react';
import { 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.emailVerified) {
                setUser(user);
            } else {
                setUser(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Auth State Change Error:", error);
            setAuthError(error.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const Login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                throw new Error("Please verify your email before logging in.");
            }
            setUser(userCredential.user);
            setAuthError(null);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            setAuthError(error.message);
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
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
            Login, 
            logout, 
            loading,
            authError,
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
