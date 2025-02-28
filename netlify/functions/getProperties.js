const admin = require('firebase-admin');
const { initializeFirebaseAdmin } = require('./utils/initializeFirebaseAdmin');

exports.handler = async (event, context) => {
    // Enable CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                'Access-Control-Allow-Credentials': 'true'
            }
        };
    }

    // Verify method
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
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
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (!decodedToken) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }

        // Get properties from Firestore
        const propertiesRef = admin.firestore().collection('properties');
        const snapshot = await propertiesRef.get();

        const properties = [];
        snapshot.forEach(doc => {
            properties.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(properties)
        };
    } catch (error) {
        console.error('Error getting properties:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
