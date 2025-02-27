const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
    const serviceAccountPath = path.join(__dirname, 'config', 'serviceAccount.json');
    console.log('Looking for service account at:', serviceAccountPath);
    
    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`Service account file not found at ${serviceAccountPath}`);
    }
    
    const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
    console.log('Service account file found and read');
    
    const serviceAccount = JSON.parse(serviceAccountContent);
    console.log('Service account JSON parsed successfully');

    const app = initializeApp({
        credential: cert(serviceAccount)
    }, 'initializeSuperAdmin');

    const db = getFirestore();
    const auth = getAuth();

    exports.handler = async (event) => {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: ''
            };
        }

        // Only allow POST requests
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers: { 'Content-Type': 'application/json' },
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: 'Super admin credentials not configured',
                        details: {
                            email: !SUPER_ADMIN_EMAIL ? 'Missing SUPER_ADMIN_EMAIL' : 'Set',
                            password: !SUPER_ADMIN_PASSWORD ? 'Missing SUPER_ADMIN_PASSWORD' : 'Set'
                        }
                    })
                };
            }

            // Check if super admin already exists
            try {
                const userRecord = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: 'Super admin already exists',
                        uid: userRecord.uid
                    })
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: 'Super admin created successfully',
                    uid: userRecord.uid
                })
            };
        } catch (error) {
            console.error('Error creating super admin:', error);
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: 'Failed to create super admin',
                    details: error.message,
                    stack: error.stack
                })
            };
        }
    };
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    
    exports.handler = async () => ({
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            error: 'Failed to initialize Firebase Admin',
            details: error.message,
            stack: error.stack
        })
    });
}
