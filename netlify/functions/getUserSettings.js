const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { initializeFirebaseAdmin } = require('./utils/initializeFirebaseAdmin');
const jwt = require('jsonwebtoken');

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

const getUserSettings = async (db, userId) => {
    try {
        // Get user settings from Firestore (BEST PRACTICE)
        const doc = await db.collection('user_settings').doc(userId).get();

        return doc.exists ? doc.data() : defaultSettings;
    } catch (error) {
        console.error('GetUserSettings error:', error);
        return defaultSettings;
    }
};

exports.handler = async (event) => {
    // Handle Preflight CORS requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: ''
        };
    }

    // Validate HTTP method
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*'
            },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Initialize Firebase Admin
        await initializeFirebaseAdmin();
        const db = getFirestore();

        // Extract and verify JWT token
        const authHeader = event.headers.authorization;
        if (!authHeader) {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*'
                },
                body: JSON.stringify({ error: 'No authorization token provided' })
            };
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.error('JWT Verification Error:', jwtError);
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*'
                },
                body: JSON.stringify({ error: 'Invalid or expired token' })
            };
        }

        // Fetch user settings
        const userSettings = await getUserSettings(db, decoded.userId);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify(userSettings)
        };
    } catch (error) {
        console.error('Detailed Error in getUserSettings:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*'
            },
            body: JSON.stringify({ 
                error: 'Internal Server Error',
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};
