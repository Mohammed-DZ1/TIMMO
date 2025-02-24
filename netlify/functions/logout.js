exports.handler = async () => {
    return {
        statusCode: 200,
        headers: {
            'Set-Cookie': 'authToken=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict',
        },
        body: JSON.stringify({ message: 'Logged out' }),
    };
};
