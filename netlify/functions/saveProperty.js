const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const console = console; // Add this line to ensure console is defined

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const verifyToken = (req) => {
  console.log('Verifying token...');
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new Error('Unauthorized - No token provided');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.handler = async (event, context) => {
    console.log('Handling save property request...');
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
        const decoded = verifyToken(event);
        console.log('Token verified successfully:', decoded);

        // Parse property data
        const propertyData = JSON.parse(event.body);

        // Connect to MongoDB
        await client.connect();
        const db = client.db(dbName);
        const propertiesCollection = db.collection('properties');

        // Add metadata
        propertyData.createdBy = decoded.id;
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
            statusCode: error.name === 'JsonWebTokenError' ? 401 : (error.statusCode || 500),
            headers,
            body: JSON.stringify({
                message: error.name === 'JsonWebTokenError' 
                    ? 'Unauthorized - Invalid token'
                    : (error.message || 'Internal server error')
            })
        };
    } finally {
        await client.close();
    }
};
