const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }

        // Only allow POST requests
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }

        // Initialize Firebase Admin
        const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!rawServiceAccount) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
        }

        let serviceAccount;
        try {
            serviceAccount = JSON.parse(rawServiceAccount);
        } catch (parseError) {
            const cleanedServiceAccount = rawServiceAccount
                .replace(/\\n/g, '\n')
                .replace(/\\\"/g, '"')
                .replace(/^\"|\"$/g, '')
                .trim();
            serviceAccount = JSON.parse(cleanedServiceAccount);
        }

        // Initialize Firebase Admin if not already initialized
        let app;
        if (getApps().length === 0) {
            app = initializeApp({
                credential: cert(serviceAccount)
            });
        } else {
            app = getApps()[0];
        }

        const auth = getAuth(app);
        const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
        const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

        if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Super admin credentials not configured' })
            };
        }

        // Get user by email
        const userRecord = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
        
        // Update password
        await auth.updateUser(userRecord.uid, {
            password: SUPER_ADMIN_PASSWORD
        });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
                message: 'Super admin password reset successfully',
                uid: userRecord.uid
            })
        };
    } catch (error) {
        console.error('Error resetting super admin password:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Failed to reset super admin password',
                details: error.message
            })
        };
    }
};
