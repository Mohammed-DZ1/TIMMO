const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    const token = event.headers.cookie?.split('authToken=')[1];

    if (!token) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Not authenticated' }) };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { statusCode: 200, body: JSON.stringify({ email: decoded.email, role: decoded.role }) };
    } catch (error) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Invalid token' }) };
    }
};
