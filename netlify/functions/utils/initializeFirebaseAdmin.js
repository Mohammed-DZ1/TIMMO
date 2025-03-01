const admin = require('firebase-admin');

let isInitialized = false;

const initializeFirebaseAdmin = async () => {
    // If already initialized, return immediately
    if (isInitialized) {
        return;
    }

    try {
        // Check if Firebase Admin is already initialized
        if (admin.apps.length > 0) {
            console.log('Firebase Admin already initialized');
            isInitialized = true;
            return;
        }

        // Validate environment variable
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
        }

        // Parse service account
        let serviceAccount;
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (parseError) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', {
                originalError: parseError.message,
                rawServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT
            });
            throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT JSON: ${parseError.message}`);
        }

        // Validate required fields
        const requiredFields = ['project_id', 'private_key', 'client_email'];
        const missingFields = requiredFields.filter(field => !serviceAccount[field]);
        
        if (missingFields.length > 0) {
            console.error('Missing Firebase service account fields:', missingFields);
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Sanitize private key
        const privateKey = serviceAccount.private_key
            .replace(/\\n/g, '\n')
            .replace(/^"/, '')
            .replace(/"$/, '')
            .trim();

        // Detailed logging of initialization attempt
        console.log('Initializing Firebase Admin with:', {
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKeyPresent: !!privateKey
        });

        // Initialize Firebase Admin
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: privateKey
            }),
            // Optional: Add Firestore database URL if needed
            // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
        });

        isInitialized = true;
        console.log('Firebase Admin initialized successfully');

    } catch (error) {
        // Comprehensive error logging
        console.error('Firebase Admin Initialization Error:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            environmentVariables: {
                FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT ? 'SET' : 'NOT SET'
            }
        });

        // Re-throw the error to be caught by the caller
        throw error;
    }
};

module.exports = { initializeFirebaseAdmin };
