const jwt = require('jsonwebtoken');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

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

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const app = initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

const getUserSettings = async (email) => {
    try {
        // Get user settings from Firestore
        const userSettingsRef = db.collection('user_settings').doc(email);
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
