exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    const { email, password } = JSON.parse(event.body);

    // Read credentials from Netlify environment variables
    const adminEmail = process.env.REACT_APP_AUTH_EMAIL;
    const adminPassword = process.env.REACT_APP_AUTH_PASSWORD;

    // Check if the credentials are correct
    if (email === adminEmail && password === adminPassword) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Login successful',
                role: 'Super Admin',
                token: 'super_admin_token', // Replace with a proper JWT implementation later
            }),
        };
    }

    return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials' }),
    };
};
