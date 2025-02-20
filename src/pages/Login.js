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
            const response = await axios.post('/.netlify/functions/Login',
                { email, password },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.status === 200) {
                const { token, role } = response.data;


                sessionStorage.setItem('authToken', token);
                sessionStorage.setItem('userRole', role);
                sessionStorage.setItem('tokenExpiry', Date.now() + 24 * 60 * 60 * 1000)

                alert('Login successful!');
                navigate('/');  
            }
        } catch (error) {
            console.error('Login error:', error.response?.data?.message || error.message);
            setErrorMessage(error.response?.data?.message || 'Invalid email or password. Please try again.');
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
