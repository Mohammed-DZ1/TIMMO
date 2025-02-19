const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: ''
        };
    }

    
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

     Netlify Functions console (Remove in production)
    console.log("ENV SUPER_ADMIN_EMAIL:", process.env.SUPER_ADMIN_EMAIL);
    console.log("ENV SUPER_ADMIN_PASSWORD:", process.env.SUPER_ADMIN_PASSWORD);
    console.log("Received Email:", email);
    console.log("Received Password:", password);

   
    if (email === superAdminEmail && password === superAdminPassword) {
        // ✅ Generate JWT Token
        const token = jwt.sign(
            { email, role: 'Super Admin' },
            secretKey,
            { expiresIn: '24h' } // Token expires in 24 hours
        );

        return {
            statusCode: 200,
            headers: {
                'Set-Cookie': `authToken=${token}; HttpOnly; Path=/; Max-Age=${24 * 60 * 60}; Secure; SameSite=None`,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/json'
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