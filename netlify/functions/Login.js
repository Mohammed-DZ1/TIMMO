const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    try {
        // Handle Preflight CORS requests
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
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

            // Get the domain from SITE_URL or use a default
            const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
            const domain = new URL(siteUrl).hostname;

            // Set secure cookie options
            const cookieOptions = [
                `authToken=${token}`,
                'Path=/',
                'HttpOnly',
                domain !== 'localhost' ? 'Secure' : '',
                domain !== 'localhost' ? `Domain=${domain}` : '',
                'SameSite=Strict',
                'Max-Age=86400' // 24 hours
            ].filter(Boolean).join('; ');

            return {
                statusCode: 200,
                headers: {
                    'Set-Cookie': cookieOptions,
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Login successful',
                    email,
                    role: 'Super Admin'
                }),
            };
        }

        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Invalid credentials' }),
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};