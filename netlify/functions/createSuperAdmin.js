const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const app = initializeApp({
    credential: cert(serviceAccount)
}, 'createSuperAdmin');

const db = getFirestore();
const auth = getAuth();

// Super admin credentials from environment variables
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Admin';

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: ''
        };
    }

    try {
        // Verify if request is from an authenticated user
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        // Only allow updates if the user is the super admin
        if (decodedToken.email !== SUPER_ADMIN_EMAIL) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Only the super admin can perform this action' })
            };
        }

        const { email, password, name } = JSON.parse(event.body);

        // Verify the provided email matches the super admin email
        if (email !== SUPER_ADMIN_EMAIL) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Cannot change super admin email' })
            };
        }

        // Create or update the user in Firebase Auth
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
            await auth.updateUser(userRecord.uid, {
                password: password || SUPER_ADMIN_PASSWORD,
                displayName: name || SUPER_ADMIN_NAME
            });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                userRecord = await auth.createUser({
                    email: SUPER_ADMIN_EMAIL,
                    password: SUPER_ADMIN_PASSWORD,
                    displayName: SUPER_ADMIN_NAME
                });
            } else {
                throw error;
            }
        }

        // Set custom claims for super admin
        await auth.setCustomUserClaims(userRecord.uid, { superadmin: true });

        // Update or create user document in Firestore
        const userRef = db.collection('users').doc(userRecord.uid);
        await userRef.set({
            email: SUPER_ADMIN_EMAIL,
            name: name || SUPER_ADMIN_NAME,
            role: 'superadmin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Super admin updated successfully',
                userId: userRecord.uid
            })
        };
    } catch (error) {
        console.error('Error updating super admin:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
