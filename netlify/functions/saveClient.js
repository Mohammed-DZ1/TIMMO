const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

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

const MONGODB_TIMEOUT = 5000; // 5 seconds timeout

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

        // Parse client data
        const clientData = JSON.parse(event.body);

        // Connect to MongoDB with proper replica set options
        const uri = process.env.MONGODB_URI;
        client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: MONGODB_TIMEOUT,
            socketTimeoutMS: MONGODB_TIMEOUT,
            connectTimeoutMS: MONGODB_TIMEOUT,
            maxPoolSize: 1,
            retryWrites: true,
            w: 'majority',
            directConnection: false
        });

        await client.connect();
        
        const db = client.db(process.env.MONGODB_DB_NAME);
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

            // Save property with timeout and write concern
            await Promise.race([
                propertiesCollection.insertOne(property, { writeConcern: { w: 1, wtimeout: 2500 } }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Property save timeout')), MONGODB_TIMEOUT)
                )
            ]);

            // Remove property object from client data before saving
            delete clientData.property;
        }

        // Save client with timeout and write concern
        await Promise.race([
            clientsCollection.insertOne(clientData, { writeConcern: { w: 1, wtimeout: 2500 } }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Client save timeout')), MONGODB_TIMEOUT)
            )
        ]);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Client saved successfully',
                clientId: clientData.clientId
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

        if (error.message && (error.message.includes('timeout') || error.name === 'MongoServerSelectionError')) {
            return {
                statusCode: 504,
                headers,
                body: JSON.stringify({ 
                    message: 'Database connection timed out',
                    error: error.message
                })
            };
        }

        if (error.name === 'MongoServerError') {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Database error - Failed to save client' })
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
    } finally {
        if (client) {
            try {
                await Promise.race([
                    client.close(true), // Force close
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Connection close timeout')), 1000)
                    )
                ]);
            } catch (e) {
                log('Error closing MongoDB connection:', e);
            }
        }
    }
};
