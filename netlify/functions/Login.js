const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    const { email, password } = JSON.parse(event.body);
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const secretKey = process.env.JWT_SECRET;

    if (email === superAdminEmail && password === superAdminPassword) {
        // 
        const token = jwt.sign(
            { email, role: 'Super Admin' },
            secretKey,
            { expiresIn: '24h' }
        );

        return {
            statusCode: 200,
            headers: {
                'Set-Cookie': `authToken=${token}; HttpOnly; Path=/; Max-Age=${24 * 60 * 60}; Secure; SameSite=Strict`,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({
                message: 'Login successful',
                token,  
                email,
                role: 'Super Admin',
            }),
        };
    }

    return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials' }),
    };
};
