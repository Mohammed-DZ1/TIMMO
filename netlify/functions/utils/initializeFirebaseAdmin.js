const admin = require('firebase-admin');

let isInitialized = false;

const initializeFirebaseAdmin = async () => {
    if (isInitialized) {
        return;
    }

    try {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
        }

        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error('Invalid Firebase service account configuration');
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: serviceAccount.project_id,
                    clientEmail: serviceAccount.client_email,
                    privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
                })
            });
            
            isInitialized = true;
            console.log('Firebase Admin initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
        throw new Error(`Firebase initialization failed: ${error.message}`);
    }
};

module.exports = { initializeFirebaseAdmin };
