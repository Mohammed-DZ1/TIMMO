import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/.netlify/functions/Login', { email, password });

            if (response.status === 200) {
                const { role, token } = response.data;

                // Set token expiry for 24 hours
                const tokenExpiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;  // 24 hours

                // Store user role, auth token, and expiry time
                localStorage.setItem('userRole', role);
                localStorage.setItem('authToken', token);
                localStorage.setItem('tokenExpiry', tokenExpiryTime);

                alert('Login successful!');
                navigate('/');  // Redirect to dashboard
            }
        } catch (error) {
            setErrorMessage('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

                {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white w-full p-2 rounded">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;