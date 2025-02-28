const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
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

        // Initialize Firebase Admin only once
        let app;
        if (getApps().length === 0) {
            const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
            if (!rawServiceAccount) {
                throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
            }

            let serviceAccount;
            try {
                serviceAccount = JSON.parse(rawServiceAccount);
            } catch (parseError) {
                serviceAccount = JSON.parse(
                    rawServiceAccount.replace(/\\n/g, '\n').trim()
                );
            }

            app = initializeApp({
                credential: cert(serviceAccount)
            });
        } else {
            app = getApps()[0];
        }

        const db = getFirestore(app);
        const auth = getAuth(app);

        const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
        const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
        const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Admin';

        if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Super admin credentials not configured' })
            };
        }

        // Check if super admin already exists
        try {
            const userRecord = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    message: 'Super admin already exists',
                    uid: userRecord.uid
                })
            };
        } catch (error) {
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

        // Create user document in Firestore (BEST PRACTICE)
        const userRef = db.collection('users').doc(userRecord.uid);
        const userSnapshot = await userRef.get();

        await userRef.set({
            email: SUPER_ADMIN_EMAIL,
            name: SUPER_ADMIN_NAME,
            role: 'super_admin',
            createdAt: userSnapshot.exists ? userSnapshot.data().createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
                message: 'Super admin created successfully',
                uid: userRecord.uid
            })
        };
    } catch (error) {
        console.error('Error creating super admin:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Failed to create super admin',
                details: error.message
            })
        };
    }
};
