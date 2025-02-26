const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

let cachedDb = null;

async function connectToDatabase(uri) {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME);
        cachedDb = db;
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

exports.handler = async (event, context) => {
    // Set context.callbackWaitsForEmptyEventLoop to false to prevent timeout
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

        // Connect to MongoDB
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const clientsCollection = db.collection('clients');
        const propertiesCollection = db.collection('properties');

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
            await propertiesCollection.insertOne(property);

            // Remove property object from client data before saving
            delete clientData.property;
        }

        // Save client
        await clientsCollection.insertOne(clientData);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Client saved successfully',
                clientId: clientData.clientId
            })
        };

    } catch (error) {
        console.error('Save client error:', error);
        
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ message: 'Unauthorized - Invalid or expired token' })
            };
        }

        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Database error - Failed to save client' })
            };
        }
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
