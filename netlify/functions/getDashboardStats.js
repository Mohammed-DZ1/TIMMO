const jwt = require('jsonwebtoken');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const app = initializeApp({
    credential: cert(serviceAccount)
}, 'getDashboardStats');

const db = getFirestore();

const filterDataByDateRange = async (startDate, endDate) => {
    try {
        // Convert JavaScript dates to Firestore Timestamps
        const startTimestamp = Timestamp.fromDate(new Date(startDate));
        const endTimestamp = Timestamp.fromDate(new Date(endDate));

        // Get properties within date range (FIXED TIMESTAMP QUERY)
        const propertiesSnapshot = await db.collection('properties')
            .where('createdAt', '>=', startTimestamp)
            .where('createdAt', '<=', endTimestamp)
            .get();

        // Get agents
        const agentsSnapshot = await db.collection('agents').get();

        // Process properties
        const properties = propertiesSnapshot.docs.map(doc => doc.data());
        const agents = agentsSnapshot.docs.map(doc => doc.data());

        const activeProperties = properties.filter(p => p.status === 'active').length;
        const totalAgents = agents.length;
        
        // Calculate revenue growth (assuming price field in properties)
        const revenue = properties.reduce((sum, p) => sum + (p.price || 0), 0);
        
        // Calculate average price
        const averagePrice = properties.length > 0 
            ? revenue / properties.length 
            : 0;

        // Calculate average days on market
        const totalDays = properties.reduce((sum, p) => {
            if (!p.listedDate) return sum;
            const listedDate = new Date(p.listedDate);
            const soldDate = p.status === 'sold' ? new Date(p.soldDate) : new Date();
            return sum + Math.floor((soldDate - listedDate) / (1000 * 60 * 60 * 24));
        }, 0);

        const averageDaysOnMarket = properties.length > 0 
            ? Math.round(totalDays / properties.length)
            : 0;

        // Calculate conversion rate
        const soldProperties = properties.filter(p => p.status === 'sold').length;
        const conversionRate = properties.length > 0
            ? Math.round((soldProperties / properties.length) * 100)
            : 0;

        return {
            activeProperties,
            totalAgents,
            revenueGrowth: revenue,
            averagePrice,
            averageDaysOnMarket,
            conversionRate
        };
    } catch (error) {
        console.error('Error filtering data:', error);
        throw error;
    }
};

const filterDataByType = async (filter) => {
    try {
        // Get properties with optimized Firestore read
        const propertiesSnapshot = await db.collection('properties')
            .where('type', '==', filter)
            .where('status', '==', 'active')
            .get();

        return {
            activeProperties: propertiesSnapshot.size
        };
    } catch (error) {
        console.error('Error filtering data:', error);
        throw error;
    }
};

exports.handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: ''
        };
    }

    try {
        // Verify JWT token
        const token = event.headers.authorization?.split(' ')[1];
        if (!token) {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ error: 'No token provided' })
            };
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get query parameters
        const queryParams = event.queryStringParameters || {};
        const startDate = queryParams.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = queryParams.endDate || new Date().toISOString();
        const filter = queryParams.filter;

        // Get filtered data
        const stats = filter 
            ? await filterDataByType(filter) 
            : await filterDataByDateRange(startDate, endDate);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify(stats)
        };
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
