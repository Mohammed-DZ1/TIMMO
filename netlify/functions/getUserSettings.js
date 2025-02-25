const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const defaultSettings = {
    theme: 'light',
    language: 'en',
    notifications: {
        email: true,
        push: false
    },
    dashboard: {
        showKPIs: true,
        showCharts: true,
        refreshInterval: 300 // 5 minutes
    }
};

const getUserSettings = async (email) => {
    let client;
    try {
        // Connect to MongoDB
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('timmo');

        // Get user settings from database
        const userSettings = await db.collection('user_settings').findOne(
            { email },
            { projection: { _id: 0 } }
        );

        return userSettings || defaultSettings;
    } catch (error) {
        console.error('GetUserSettings error:', error);
        return defaultSettings;
    } finally {
        if (client) {
            await client.close();
        }
    }
};

exports.handler = async (event) => {
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
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user settings
        const userSettings = await getUserSettings(decoded.email);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userSettings)
        };
    } catch (error) {
        console.error('GetUserSettings error:', error);
        return {
            statusCode: error.name === 'JsonWebTokenError' ? 401 : 500,
            headers: {
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ 
                message: error.name === 'JsonWebTokenError' 
                    ? 'Session expired' 
                    : 'Internal server error' 
            })
        };
    }
};
