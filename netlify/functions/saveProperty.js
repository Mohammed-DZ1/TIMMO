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

        // Parse property data
        const propertyData = JSON.parse(event.body);

        // Add metadata
        propertyData.createdBy = decoded.email;
        propertyData.createdAt = new Date();
        propertyData.updatedAt = new Date();

        // Handle media files
        if (propertyData.media && propertyData.media.length > 0) {
            propertyData.mediaUrls = propertyData.media;
            delete propertyData.media;
        }

        // Save to Firestore
        const propertiesRef = db.collection('properties');
        const docRef = propertyData.propertyId ? 
            propertiesRef.doc(propertyData.propertyId) : 
            propertiesRef.doc();

        await docRef.set(propertyData, { merge: true });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Property saved successfully',
                propertyId: docRef.id
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
