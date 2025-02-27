const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const app = initializeApp({
    credential: cert(serviceAccount)
}, 'initializeSuperAdmin');

const auth = getAuth();
const db = getFirestore();

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
        const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
        const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Admin';

        if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Super admin credentials not configured' })
            };
        }

        // Check if super admin already exists
        try {
            const userRecord = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Super admin already exists' })
            };
        } catch (error) {
            // If error.code === 'auth/user-not-found' then proceed with creation
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
        }

        // Create the super admin user
        const userRecord = await auth.createUser({
            email: SUPER_ADMIN_EMAIL,
            password: SUPER_ADMIN_PASSWORD,
            displayName: SUPER_ADMIN_NAME,
        });

        // Set custom claims for super admin
        await auth.setCustomUserClaims(userRecord.uid, {
            role: 'super_admin'
        });

        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            email: SUPER_ADMIN_EMAIL,
            name: SUPER_ADMIN_NAME,
            role: 'super_admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Super admin created successfully',
                uid: userRecord.uid
            })
        };
    } catch (error) {
        console.error('Error creating super admin:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to create super admin',
                details: error.message
            })
        };
    }
};
