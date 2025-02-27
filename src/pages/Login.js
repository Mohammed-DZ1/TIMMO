import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import './Login.css';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.email || !formData.password) {
            setError(t('Please fill in all fields'));
            setLoading(false);
            return;
        }

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                navigate('/', { replace: true });
            } else {
                setError(result.error || t('Login failed'));
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(t('Login failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="box">
                <div className="login">
                    <div className="loginBx">
                        <h2>
                            <i className="fa-solid fa-right-to-bracket"></i>
                            {t('Login')}
                            <i className="fa-solid fa-heart"></i>
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t('Email')}
                                disabled={loading}
                            />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={t('Password')}
                                disabled={loading}
                            />
                            {error && <div className="error-message">{error}</div>}
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="submit-btn"
                            >
                                {loading ? t('Logging in...') : t('Sign in')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
