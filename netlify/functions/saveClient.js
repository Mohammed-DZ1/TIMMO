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
        'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
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

        // Parse client data
        const clientData = JSON.parse(event.body);

        // Add metadata
        clientData.createdBy = decodedToken.uid;
        clientData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        const clientsRef = db.collection('clients');
        let savedClient;

        if (clientData.clientId) {
            // Update existing client (Ensuring Firestore merge update)
            await clientsRef.doc(clientData.clientId).set(clientData, { merge: true });
            savedClient = { clientId: clientData.clientId, ...clientData };
        } else {
            // Add new client (Ensure Firestore timestamp)
            const docRef = await clientsRef.add({
                ...clientData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: decodedToken.uid
            });
            savedClient = { clientId: docRef.id, ...clientData };
        }

        // If client is an owner and has property, save both
        if (clientData.type === 'OWNER' && clientData.property) {
            const property = clientData.property;
            property.clientId = savedClient.clientId;
            property.createdBy = decodedToken.uid;
            property.updatedAt = admin.firestore.FieldValue.serverTimestamp();

            // Save property
            await db.collection('properties').add(property);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Client saved successfully',
                clientId: savedClient.clientId
            })
        };

    } catch (error) {
        log('Save client error:', error);

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
                    message: 'Permission denied - Insufficient privileges to save client'
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
