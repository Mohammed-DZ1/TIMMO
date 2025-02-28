const admin = require('firebase-admin');

let isInitialized = false;

const initializeFirebaseAdmin = async () => {
    if (isInitialized) {
        return;
    }

    try {
        // Check if environment variable exists
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
            throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
        }

        // Attempt to parse service account
        let serviceAccount;
        try {
            // First, try to parse the environment variable
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (parseError) {
            console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', {
                originalError: parseError.message,
                environmentVariable: process.env.FIREBASE_SERVICE_ACCOUNT
            });
            throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT JSON format: ${parseError.message}`);
        }

        // Validate required fields
        const requiredFields = ['project_id', 'private_key', 'client_email'];
        const missingFields = requiredFields.filter(field => !serviceAccount[field]);
        
        if (missingFields.length > 0) {
            console.error('Missing required Firebase service account fields:', missingFields);
            throw new Error(`Missing required Firebase service account fields: ${missingFields.join(', ')}`);
        }

        // Handle private key properly
        const privateKey = serviceAccount.private_key
            .replace(/\\n/g, '\n')  // Replace escaped newlines
            .replace(/\$\{n\}/g, '\n')  // Handle ${n} format
            .replace(/\$\{newline\}/g, '\n') // Handle ${newline} format
            .replace(/^"/, '')  // Remove leading quote
            .replace(/"$/, ''); // Remove trailing quote

        // Initialize Firebase Admin only if not already initialized
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
        console.error('Comprehensive Firebase Admin Initialization Error:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            environmentVariables: {
                FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT ? 'SET' : 'NOT SET'
            }
        });
        throw error;
    }
};

module.exports = { initializeFirebaseAdmin };
