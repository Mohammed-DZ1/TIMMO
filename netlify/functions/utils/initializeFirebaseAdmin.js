const admin = require('firebase-admin');

const initializeFirebaseAdmin = async () => {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
        throw error;
    }
};

module.exports = { initializeFirebaseAdmin };
