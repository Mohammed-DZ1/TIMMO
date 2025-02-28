const jwt = require('jsonwebtoken');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
};

// Initialize Firebase Admin only once
let app;
if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    app = initializeApp({
        credential: cert(serviceAccount)
    });
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

const validateSettings = (settings) => {
    if (typeof settings !== 'object' || settings === null) {
        throw new Error('Settings must be an object');
    }

    // Validate theme
    if (settings.theme && !['light', 'dark'].includes(settings.theme)) {
        throw new Error('Invalid theme value');
    }

    // Validate language
    if (settings.language && !['en', 'es', 'fr'].includes(settings.language)) {
        throw new Error('Invalid language value');
    }

    // Validate notifications
    if (settings.notifications) {
        if (typeof settings.notifications !== 'object') {
            throw new Error('Notifications must be an object');
        }
        if ('email' in settings.notifications && typeof settings.notifications.email !== 'boolean') {
            throw new Error('Notifications email must be boolean');
        }
        if ('push' in settings.notifications && typeof settings.notifications.push !== 'boolean') {
            throw new Error('Notifications push must be boolean');
        }
    }

    // Validate dashboard settings
    if (settings.dashboard) {
        if (typeof settings.dashboard !== 'object') {
            throw new Error('Dashboard settings must be an object');
        }
        if ('showKPIs' in settings.dashboard && typeof settings.dashboard.showKPIs !== 'boolean') {
            throw new Error('Dashboard showKPIs must be boolean');
        }
        if ('showCharts' in settings.dashboard && typeof settings.dashboard.showCharts !== 'boolean') {
            throw new Error('Dashboard showCharts must be boolean');
        }
        if ('refreshInterval' in settings.dashboard) {
            const interval = settings.dashboard.refreshInterval;
            if (!Number.isInteger(interval) || interval < 60 || interval > 3600) {
                throw new Error('Dashboard refresh interval must be between 60 and 3600 seconds');
            }
        }
    }

    return true;
};

const updateUserSettings = async (email, newSettings) => {
    try {
        validateSettings(newSettings);

        // Reference user settings in Firestore
        const userSettingsRef = db.collection('user_settings').doc(email);

        // Merge new settings with current settings
        await userSettingsRef.set(
            { ...newSettings, updatedAt: db.FieldValue.serverTimestamp() },
            { merge: true }
        );

        return { message: 'Settings updated successfully' };
    } catch (error) {
        console.error('UpdateUserSettings error:', error);
        throw error;
    }
};

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    try {
        // Verify JWT token
        const token = event.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Parse and validate request body
        const settings = JSON.parse(event.body);
        const updatedSettings = await updateUserSettings(decoded.email, settings);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(updatedSettings)
        };
    } catch (error) {
        console.error('Handler error:', error);
        return {
            statusCode: error.message === 'No token provided' ? 401 : 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};
