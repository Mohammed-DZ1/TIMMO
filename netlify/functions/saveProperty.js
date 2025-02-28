const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { initializeFirebaseAdmin } = require('./utils/initializeFirebaseAdmin');

// Safe logging function
const log = (message, data) => {
    try {
        if (process.env.NODE_ENV !== 'production') {
            console.log(message, data);
        }
    } catch (e) {
        // Ignore logging errors
    }
};

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    // Verify method
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Initialize Firebase Admin
        if (!admin.apps.length) {
            await initializeFirebaseAdmin();
        }
        const db = admin.firestore();

        // Verify authentication
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (!decodedToken) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }

        // Parse property data
        const propertyData = JSON.parse(event.body);
        propertyData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        const propertiesRef = db.collection('properties');
        let savedProperty;

        if (propertyData.propertyId) {
            // Update existing property (Ensuring Firestore merge update)
            await propertiesRef.doc(propertyData.propertyId).set(propertyData, { merge: true });
            savedProperty = { propertyId: propertyData.propertyId, ...propertyData };
        } else {
            // Add new property (Ensure Firestore timestamp)
            const docRef = await propertiesRef.add({
                ...propertyData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: decodedToken.uid
            });
            savedProperty = { propertyId: docRef.id, ...propertyData };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Property saved successfully',
                propertyId: savedProperty.propertyId
            })
        };
    } catch (error) {
        log('Error saving property:', error);

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ message: 'Unauthorized - Invalid or expired token' })
            };
        }

        if (error.code === 'PERMISSION_DENIED') {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ 
                    message: 'Permission denied - Insufficient privileges to save property'
                })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                message: 'Internal server error',
                error: error.message || 'Unknown error'
            })
        };
    }
};
