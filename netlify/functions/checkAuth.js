const jwt = require('jsonwebtoken');
const { initializeFirebaseAdmin } = require('./utils/initializeFirebaseAdmin');
const { getFirestore } = require('firebase-admin/firestore');

exports.handler = async (event) => {
    // Detailed logging for all stages
    console.log('CheckAuth Function Invoked', {
        method: event.httpMethod,
        authHeader: event.headers.authorization ? 'PRESENT' : 'MISSING',
        headers: Object.keys(event.headers || {})
    });

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
        // Comprehensive Firebase Admin initialization logging
        console.log('Firebase Admin Initialization Attempt', {
            serviceAccountExists: !!process.env.FIREBASE_SERVICE_ACCOUNT,
            serviceAccountLength: process.env.FIREBASE_SERVICE_ACCOUNT?.length || 0
        });

        // Ensure Firebase Admin is initialized
        await initializeFirebaseAdmin();

        // Additional logging to verify Firestore access
        const db = getFirestore();
        console.log('Firestore Initialized', { dbPresent: !!db });

        // Get token from Authorization header
        const authHeader = event.headers.authorization;
        console.log('Authorization Header', { 
            headerPresent: !!authHeader,
            headerType: typeof authHeader
        });

        const token = authHeader?.split(' ')[1];
        if (!token) {
            console.error('No token provided');
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ 
                    isAuthenticated: false, 
                    error: 'No token provided',
                    details: {
                        authHeader: authHeader
                    }
                })
            };
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token Decoded', { 
                userId: decoded.userId, 
                email: decoded.email 
            });
        } catch (tokenError) {
            console.error('Token Verification Failed', {
                message: tokenError.message,
                name: tokenError.name
            });
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ 
                    isAuthenticated: false, 
                    error: 'Invalid token',
                    details: {
                        message: tokenError.message
                    }
                })
            };
        }

        // Get user from Firestore
        const userDoc = await db.collection('users').doc(decoded.userId).get();

        if (!userDoc.exists) {
            console.error('User not found', { userId: decoded.userId });
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ 
                    isAuthenticated: false, 
                    error: 'User not found',
                    details: {
                        userId: decoded.userId
                    }
                })
            };
        }

        const userData = userDoc.data();

        console.log('Authentication Successful', { 
            userId: userDoc.id, 
            email: userData.email 
        });

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
        // Comprehensive error logging
        console.error('Comprehensive CheckAuth Error:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            code: error.code,
            // Log environment variables (be careful not to log sensitive info)
            envVars: {
                SITE_URL: process.env.SITE_URL ? 'SET' : 'NOT SET',
                JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
                NODE_ENV: process.env.NODE_ENV,
                FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT 
                    ? `SET (${process.env.FIREBASE_SERVICE_ACCOUNT.length} chars)` 
                    : 'NOT SET'
            }
        });

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ 
                message: 'Internal Server Error',
                error: process.env.NODE_ENV === 'development' 
                    ? { 
                        message: error.message, 
                        name: error.name,
                        code: error.code 
                    } 
                    : 'An unexpected error occurred'
            })
        };
    }
};
