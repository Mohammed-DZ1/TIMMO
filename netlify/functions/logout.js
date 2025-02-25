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
                headers: {
                    'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({ message: 'Method Not Allowed' }),
            };
        }

        // Clear the auth token cookie
        const clearCookie = [
            'authToken=',
            'Path=/',
            'HttpOnly',
            'Secure',
            'Domain=.netlify.app',
            'SameSite=None',
            'Max-Age=0',
            'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        ].join('; ');

        return {
            statusCode: 200,
            headers: {
                'Set-Cookie': clearCookie,
                'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: 'Logged out successfully' }),
        };
    } catch (error) {
        console.error('Logout error:', error);
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
