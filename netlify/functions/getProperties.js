const admin = require('firebase-admin');
const { initializeFirebaseAdmin } = require('./utils/initializeFirebaseAdmin');

// Safe logging function
const log = (message, error = null) => {
    try {
        if (process.env.NODE_ENV !== 'production') {
            if (error) {
                console.error(`[getProperties] ${message}:`, error);
            } else {
                console.log(`[getProperties] ${message}`);
            }
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    // Verify method
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Initialize Firebase Admin (BEST PRACTICE)
        if (!admin.apps.length) {
            log('Initializing Firebase Admin...');
            try {
                await initializeFirebaseAdmin();
                log('Firebase Admin initialized successfully');
            } catch (error) {
                log('Firebase Admin initialization failed', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ 
                        error: 'Internal server error',
                        details: 'Firebase initialization failed'
                    })
                };
            }
        }
        const db = admin.firestore();

        // Verify authentication
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            log('Missing or invalid authorization header');
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized - Missing or invalid token' })
            };
        }

        const token = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            log('Verifying token...');
            decodedToken = await admin.auth().verifyIdToken(token);
            log('Token verified successfully');
        } catch (error) {
            log('Token verification failed', error);
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    error: 'Unauthorized',
                    details: 'Invalid token'
                })
            };
        }

        // Get properties from Firestore (BEST PRACTICE)
        log('Fetching properties from Firestore...');
        const propertiesSnapshot = await db.collection('properties').get();
        
        const properties = propertiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        log(`Successfully fetched ${properties.length} properties`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(properties)
        };
    } catch (error) {
        log('Unexpected error occurred', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
};
