const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: '',
            };
        }

        // Get token from cookies
        const cookies = event.headers.cookie || '';
        const tokenMatch = cookies.match(/authToken=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            return {
                statusCode: 401,
                headers: {
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({ message: 'Not authenticated' })
            };
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check if token is about to expire (less than 1 hour remaining)
            const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
            const shouldRefresh = expiresIn < 3600; // less than 1 hour
            
            let headers = {
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/json'
            };

            // If token is about to expire, refresh it
            if (shouldRefresh) {
                const newToken = jwt.sign(
                    { email: decoded.email, role: decoded.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );

                // Get the domain from SITE_URL or use a default
                const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
                const domain = new URL(siteUrl).hostname;

                // Set secure cookie options
                const cookieOptions = [
                    `authToken=${newToken}`,
                    'Path=/',
                    'HttpOnly',
                    domain !== 'localhost' ? 'Secure' : '',
                    domain !== 'localhost' ? `Domain=${domain}` : '',
                    'SameSite=Strict',
                    'Max-Age=86400' // 24 hours
                ].filter(Boolean).join('; ');

                headers['Set-Cookie'] = cookieOptions;
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    email: decoded.email,
                    role: decoded.role,
                    tokenRefreshed: shouldRefresh
                })
            };
        } catch (error) {
            // If token verification fails, clear the invalid cookie
            const clearCookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
            
            return {
                statusCode: 401,
                headers: {
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true',
                    'Set-Cookie': clearCookie
                },
                body: JSON.stringify({ message: 'Session expired' })
            };
        }
    } catch (error) {
        console.error('CheckAuth error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
