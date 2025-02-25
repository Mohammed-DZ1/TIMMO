const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': 'https://timmodashboard.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        // Get token from cookie
        const token = event.headers.cookie?.split(';')
            .find(c => c.trim().startsWith('token='))
            ?.split('=')[1];

        if (!token) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ message: 'Unauthorized - No token provided' })
            };
        }

        // Verify token
        const user = jwt.verify(token, process.env.JWT_SECRET);

        // Parse property data
        const propertyData = JSON.parse(event.body);

        // Connect to MongoDB
        await client.connect();
        const db = client.db(dbName);
        const propertiesCollection = db.collection('properties');

        // Add metadata
        propertyData.createdBy = user.id;
        propertyData.createdAt = new Date();
        propertyData.updatedAt = new Date();

        // Handle media files
        // Note: You'll need to implement file upload separately
        // This is just storing the references
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
        return {
            statusCode: error.name === 'JsonWebTokenError' ? 401 : 500,
            headers,
            body: JSON.stringify({
                message: error.name === 'JsonWebTokenError' 
                    ? 'Unauthorized - Invalid token'
                    : 'Internal server error'
            })
        };
    } finally {
        await client.close();
    }
};
