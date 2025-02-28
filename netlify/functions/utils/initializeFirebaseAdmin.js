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

        let serviceAccount;
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (error) {
            console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
            throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON format');
        }
        
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error('Missing required Firebase service account fields');
        }

        // Handle private key properly
        const privateKey = serviceAccount.private_key
            .replace(/\\n/g, '\n')  // Replace escaped newlines
            .replace(/\$\{n\}/g, '\n')  // Handle ${n} format
            .replace(/\$\{newline\}/g, '\n'); // Handle ${newline} format

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: serviceAccount.project_id,
                    clientEmail: serviceAccount.client_email,
                    privateKey: privateKey
                })
            });
            
            isInitialized = true;
            console.log('Firebase Admin initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error.message);
        if (error.message.includes('private_key')) {
            console.error('Private key issue detected. Please check FIREBASE_SERVICE_ACCOUNT format.');
        }
        throw error;
    }
};

module.exports = { initializeFirebaseAdmin };
