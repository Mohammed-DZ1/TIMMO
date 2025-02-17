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

    // Check if the credentials are correct
    if (email === superAdminEmail && password === superAdminPassword) {
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