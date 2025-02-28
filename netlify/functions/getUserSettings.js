const admin = require('firebase-admin');
const { initializeFirebaseAdmin } = require('./utils/initializeFirebaseAdmin');

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

const getUserSettings = async (userId) => {
    try {
        // Get user settings from Firestore
        const userSettingsRef = admin.firestore().collection('user_settings').doc(userId);
        const doc = await userSettingsRef.get();

        if (doc.exists) {
            return doc.data();
        }
        return defaultSettings;
    } catch (error) {
        console.error('GetUserSettings error:', error);
        return defaultSettings;
    }
};

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    try {
        // Initialize Firebase Admin
        if (!admin.apps.length) {
            await initializeFirebaseAdmin();
        }

        // Verify authentication
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (!decodedToken) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }

        const settings = await getUserSettings(decodedToken.uid);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(settings)
        };
    } catch (error) {
        console.error('Error in getUserSettings:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
};
