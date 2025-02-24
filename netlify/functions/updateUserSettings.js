const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
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

    let client;
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Parse settings from request body
        const settings = JSON.parse(event.body);

        // Validate settings
        const allowedSettings = ['theme', 'language', 'notifications', 'dashboardLayout'];
        const validatedSettings = {};
        for (const [key, value] of Object.entries(settings)) {
            if (allowedSettings.includes(key)) {
                validatedSettings[key] = value;
            }
        }

        // Connect to MongoDB
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('timmo');

        // Update user settings
        await db.collection('user_settings').updateOne(
            { email: decoded.email },
            { 
                $set: validatedSettings,
                $setOnInsert: { email: decoded.email }
            },
            { upsert: true }
        );

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: 'Settings updated successfully',
                settings: validatedSettings
            })
        };
    } catch (error) {
        console.error('UpdateUserSettings error:', error);
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
    } finally {
        if (client) {
            await client.close();
        }
    }
};
