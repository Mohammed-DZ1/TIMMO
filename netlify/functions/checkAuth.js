const jwt = require('jsonwebtoken');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin if not already initialized
let app;
if (!global._firebaseAdminInitialized) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    app = initializeApp({ credential: cert(serviceAccount) }, 'checkAuth');
    global._firebaseAdminInitialized = true;
}

const db = getFirestore();

exports.handler = async (event) => {
    // Handle CORS preflight
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

    // Allow only GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        // Get token from Authorization header
        const token = event.headers.authorization?.split(' ')[1];
        if (!token) {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ isAuthenticated: false, error: 'No token provided' })
            };
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return {
                statusCode: 403,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ isAuthenticated: false, error: 'Invalid token' })
            };
        }

        // Get user from Firestore (BEST PRACTICE)
        const userDoc = await db.collection('users').doc(decoded.id).get();

        if (!userDoc.exists) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ isAuthenticated: false, error: 'User not found' })
            };
        }

        const userData = userDoc.data();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({
                isAuthenticated: true,
                user: {
                    id: userDoc.id,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                    permissions: userData.permissions
                }
            })
        };
    } catch (error) {
        console.error('Auth check error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ 
                isAuthenticated: false,
                error: error.message 
            })
        };
    }
};
