const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    try {
        // Handle Preflight CORS requests
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: '',
            };
        }

        // Allow only POST requests
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' }),
            };
        }

        const { email, password } = JSON.parse(event.body);

        // Get environment variables
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
        const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
        const secretKey = process.env.JWT_SECRET;

        // Ensure environment variables exist
        if (!superAdminEmail || !superAdminPassword || !secretKey) {
            console.error("Missing environment variables");
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({ message: 'Server configuration error' }),
            };
        }

        // Validate Credentials
        if (email === superAdminEmail && password === superAdminPassword) {
            const token = jwt.sign(
                { email, role: 'Super Admin' },
                secretKey,
                { expiresIn: '24h' }
            );

            // Set secure cookie options
            const cookieOptions = [
                `authToken=${token}`,
                'Path=/',
                'HttpOnly',
                'Secure',
                'Domain=.netlify.app',
                'SameSite=None',
                'Max-Age=86400' // 24 hours
            ].join('; ');

            return {
                statusCode: 200,
                headers: {
                    'Set-Cookie': cookieOptions,
                    'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                    'Access-Control-Allow-Credentials': 'true',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Login successful',
                    user: {
                        email,
                        role: 'Super Admin'
                    }
                }),
            };
        }

        return {
            statusCode: 401,
            headers: {
                'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ message: 'Invalid credentials' }),
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
