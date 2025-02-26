const jwt = require('jsonwebtoken');

const checkAuth = async (event) => {
    try {
        // Handle Preflight CORS requests
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: '',
            };
        }

        // Allow only GET requests
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                headers: {
                    'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({ message: 'Method Not Allowed' }),
            };
        }

        console.log('Headers received:', event.headers);
        console.log('Cookies received:', event.headers.cookie);

        // Get the token from cookies
        const cookies = event.headers.cookie || '';
        const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('authToken='));
        
        if (!tokenCookie) {
            console.log('No auth token found in cookies');
            return {
                statusCode: 401,
                headers: {
                    'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({ message: 'No authentication token' }),
            };
        }

        const token = tokenCookie.split('=')[1].trim();
        console.log('Token found:', token.substring(0, 10) + '...');

        const secretKey = process.env.JWT_SECRET;

        if (!secretKey) {
            console.error("Missing JWT_SECRET environment variable");
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({ message: 'Server configuration error' }),
            };
        }

        // Verify the token
        const decoded = jwt.verify(token, secretKey);
        console.log('Token verified for user:', decoded.email);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Authentication valid',
                user: {
                    email: decoded.email,
                    role: decoded.role
                }
            }),
        };
    } catch (error) {
        console.error('Auth check error:', error);
        return {
            statusCode: 401,
            headers: {
                'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ message: 'Invalid or expired token' }),
        };
    }
};

exports.handler = async (event) => {
    return checkAuth(event);
};
