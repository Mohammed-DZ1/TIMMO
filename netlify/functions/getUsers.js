const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const app = initializeApp({
    credential: cert(serviceAccount)
}, 'getUsers');

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
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
