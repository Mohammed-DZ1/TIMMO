const jwt = require('jsonwebtoken');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');
const { initializeFirebaseAdmin } = require('./utils/initializeFirebaseAdmin');

// Initialize Firebase Admin once
initializeFirebaseAdmin();
const db = getFirestore();

exports.handler = async (event) => {
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
        const { email, password } = JSON.parse(event.body);

        // Input validation
        if (!email || !password) {
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

        // Ensure Firebase Admin is initialized
        await initializeFirebaseAdmin();
        const db = getFirestore();

        // Find user by email
        const userSnapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (userSnapshot.empty) {
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

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
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
        console.error('Detailed Login Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
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
