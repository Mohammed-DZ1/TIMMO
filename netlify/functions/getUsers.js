const { getFirestore } = require('firebase-admin/firestore');
const { initializeFirebaseAdmin } = require('./utils/initializeFirebaseAdmin');

// Initialize Firebase Admin once
initializeFirebaseAdmin();
const db = getFirestore();

exports.handler = async () => {
    try {
        // Get users from Firestore (BEST PRACTICE)
        const usersSnapshot = await db.collection('users').get();
        
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify(users)
        };
    } catch (error) {
        console.error('Error getting users:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
