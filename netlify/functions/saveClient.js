const jwt = require('jsonwebtoken');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

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

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const app = initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const headers = {
        'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        // Get token from cookie
        const cookies = event.headers.cookie || '';
        const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('authToken='));
        
        if (!tokenCookie) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ message: 'Unauthorized - No token provided' })
            };
        }

        const token = tokenCookie.split('=')[1].trim();

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Parse client data
        const clientData = JSON.parse(event.body);

        // Add metadata
        clientData.createdBy = decoded.email;
        clientData.createdAt = new Date();
        clientData.updatedAt = new Date();

        // If client is an owner and has property, save both
        if (clientData.type === 'OWNER' && clientData.property) {
            const property = clientData.property;
            property.clientId = clientData.clientId;
            property.createdBy = decoded.email;
            property.createdAt = new Date();
            property.updatedAt = new Date();

            // Save property
            const propertiesRef = db.collection('properties');
            const propertyDocRef = propertiesRef.doc();
            await propertyDocRef.set(property);

            // Remove property object from client data before saving
            delete clientData.property;
        }

        // Save to Firestore
        const clientsRef = db.collection('clients');
        const docRef = clientData.clientId ? 
            clientsRef.doc(clientData.clientId) : 
            clientsRef.doc();

        await docRef.set(clientData, { merge: true });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Client saved successfully',
                clientId: docRef.id
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
