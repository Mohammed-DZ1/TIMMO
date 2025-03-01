const jwt = require('jsonwebtoken');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');
const { initializeFirebaseAdmin } = require('./utils/initializeFirebaseAdmin');

// Initialize Firebase Admin once
initializeFirebaseAdmin();
const db = getFirestore();

exports.handler = async (event) => {
    // Validate JWT Secret
    if (!process.env.JWT_SECRET) {
        console.error('Critical Error: JWT_SECRET environment variable is not set');
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ 
                message: 'Server Configuration Error',
                error: 'Authentication system is not properly configured'
            })
        };
    }

    // Detailed logging for all stages
    console.log('Login Function Invoked', {
        method: event.httpMethod,
        body: event.body ? 'PRESENT' : 'MISSING',
        headers: Object.keys(event.headers || {})
    });

    // Handle Preflight CORS requests
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

    // Allow only POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        console.log('Attempting to initialize Firebase Admin');
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

        console.log('Parsing request body');
        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (parseError) {
            console.error('Failed to parse request body', {
                rawBody: event.body,
                parseError: parseError.message
            });
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ message: 'Invalid request body' })
            };
        }

        const { email, password } = requestBody;

        // Input validation
        if (!email || !password) {
            console.error('Missing email or password', { 
                emailPresent: !!email, 
                passwordPresent: !!password 
            });
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ message: 'Email and password are required' })
            };
        }

        console.log('Searching for user', { email });
        // Find user by email
        const userSnapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (userSnapshot.empty) {
            console.error('User not found', { email });
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ message: 'Invalid credentials' })
            };
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        console.log('Verifying password', { userFound: !!userData });
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
            console.error('Invalid password', { email });
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ message: 'Invalid credentials' })
            };
        }

        console.log('Generating JWT token', { userId: userDoc.id });
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: userDoc.id, 
                email: userData.email, 
                role: userData.role || 'user',
                exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiration
            },
            process.env.JWT_SECRET
        );

        console.log('Login successful', { userId: userDoc.id });
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ 
                token, 
                user: {
                    id: userDoc.id,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role
                }
            })
        };
    } catch (error) {
        // Comprehensive error logging
        console.error('Comprehensive Login Error:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            code: error.code,
            // Log environment variables (be careful not to log sensitive info)
            envVars: {
                SITE_URL: process.env.SITE_URL ? 'SET' : 'NOT SET',
                JWT_SECRET: process.env.JWT_SECRET ? 'MASKED' : 'NOT SET',
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
