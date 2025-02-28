const jwt = require('jsonwebtoken');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');
const { initializeFirebaseAdmin } = require('./utils/initializeFirebaseAdmin');

// Initialize Firebase Admin once
initializeFirebaseAdmin();
const db = getFirestore();

exports.handler = async (event) => {
    // Detailed logging for all stages
    console.log('Login Function Invoked', {
        method: event.httpMethod,
        body: event.body,
        headers: event.headers
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
        // Ensure Firebase Admin is initialized
        await initializeFirebaseAdmin();
        const db = getFirestore();

        console.log('Parsing request body');
        const { email, password } = JSON.parse(event.body);

        // Input validation
        if (!email || !password) {
            console.error('Missing email or password', { email: !!email, password: !!password });
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

        console.log('Verifying password');
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

        console.log('Generating JWT token');
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: userDoc.id, 
                email: userData.email, 
                role: userData.role || 'user' 
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: '24h' 
            }
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
                JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
                NODE_ENV: process.env.NODE_ENV
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
