const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    const { email, password } = JSON.parse(event.body);

    // Environment variables for super admin credentials
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const secretKey = process.env.JWT_SECRET; // JWT secret stored in Netlify env variables

    // Validate credentials
    if (email === superAdminEmail && password === superAdminPassword) {
        // Generate JWT token
        const token = jwt.sign(
            { email, role: 'Super Admin' },
            secretKey,
            { expiresIn: '2h' } // Token expires in 2 hours
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Login successful',
                role: 'Super Admin',
                token,
            }),
        };
    }

    return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials' }),
    };
};
