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
        clientData.createdAt = new Date();
        clientData.updatedAt = new Date();

        // If client is an owner and has property, save both
        if (clientData.type === 'OWNER' && clientData.property) {
            const property = clientData.property;
            property.clientId = clientData.clientId;
            property.createdBy = decodedToken.uid;
            property.createdAt = new Date();
            property.updatedAt = new Date();

            // Save property
            const propertiesRef = admin.firestore().collection('properties');
            const propertyDocRef = propertiesRef.doc();
            await propertyDocRef.set(property);

            // Remove property object from client data before saving
            delete clientData.property;
        }

        // Save to Firestore
        const clientsRef = admin.firestore().collection('clients');
        let savedClient;

        if (clientData.clientId) {
            // Update existing client
            await clientsRef.doc(clientData.clientId).update(clientData);
            savedClient = {
                clientId: clientData.clientId,
                ...clientData
            };
        } else {
            // Add new client
            const docRef = await clientsRef.add({
                ...clientData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: decodedToken.uid
            });
            savedClient = {
                clientId: docRef.id,
                ...clientData,
                createdAt: new Date().toISOString(),
                createdBy: decodedToken.uid
            };
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
