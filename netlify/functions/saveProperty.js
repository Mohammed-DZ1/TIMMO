const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let client = null;

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

        // Connect to MongoDB
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        
        const db = client.db(process.env.MONGODB_DB_NAME);
        const propertiesCollection = db.collection('properties');

        // Add metadata
        propertyData.createdBy = decoded.email;
        propertyData.createdAt = new Date();
        propertyData.updatedAt = new Date();

        // Handle media files
        if (propertyData.media && propertyData.media.length > 0) {
            propertyData.mediaUrls = propertyData.media;
            delete propertyData.media;
        }

        // Save property
        await propertiesCollection.insertOne(propertyData);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Property saved successfully',
                propertyId: propertyData.propertyId
            })
        };

    } catch (error) {
        console.error('Save property error:', error);
        
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ message: 'Unauthorized - Invalid or expired token' })
            };
        }

        if (error.name === 'MongoServerError') {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Database error - Failed to save property' })
            };
        }
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                message: 'Internal server error',
                error: error.message 
            })
        };
    } finally {
        if (client) {
            await client.close();
        }
    }
};
