const admin = require('firebase-admin');
const { initializeFirebaseAdmin } = require('./utils/initializeFirebaseAdmin');

// Default links configuration
const defaultLinks = {
    "Super Admin": [
        { path: "/", label: "Dashboard", icon: "FaHome" },
        { path: "/properties", label: "Properties", icon: "FaBuilding" },
        { path: "/clients", label: "Clients", icon: "FaUsers" },
        { path: "/agents", label: "Agents", icon: "FaUserTie" },
        { path: "/settings", label: "Settings", icon: "FaCogs" }
    ],
    "Admin": [
        { path: "/", label: "Dashboard", icon: "FaHome" },
        { path: "/properties", label: "Properties", icon: "FaBuilding" },
        { path: "/clients", label: "Clients", icon: "FaUsers" },
        { path: "/agents", label: "Agents", icon: "FaUserTie" }
    ],
    "Agent": [
        { path: "/", label: "Dashboard", icon: "FaHome" },
        { path: "/properties", label: "Properties", icon: "FaBuilding" }
    ]
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
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (!decodedToken) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }

        // Get user role from Firestore
        const userDoc = await admin.firestore()
            .collection('users')
            .doc(decodedToken.uid)
            .get();

        const userRole = userDoc.exists ? userDoc.data().role : 'Agent';
        const links = defaultLinks[userRole] || defaultLinks.Agent;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(links)
        };
    } catch (error) {
        console.error('Error in getSidebarLinks:', error);
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
