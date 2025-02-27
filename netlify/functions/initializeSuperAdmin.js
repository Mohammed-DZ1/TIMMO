const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
try {
    const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    console.log('Checking for FIREBASE_SERVICE_ACCOUNT env var');
    
    if (!rawServiceAccount) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
    }

    // Log first few characters of service account for debugging
    console.log('Service account string starts with:', rawServiceAccount.substring(0, 50));

    let serviceAccount;
    try {
        // Try parsing the raw string first
        serviceAccount = JSON.parse(rawServiceAccount);
        console.log('Successfully parsed service account JSON directly');
    } catch (parseError) {
        console.log('Initial JSON parse failed:', parseError.message);
        console.log('Cleaning string and retrying...');
        
        // If parsing fails, try to clean the string and parse again
        const cleanedServiceAccount = rawServiceAccount
            .replace(/\\n/g, '\n')  // Replace escaped newlines
            .replace(/\\\"/g, '"')  // Replace escaped quotes
            .replace(/^\"|\"$/g, '') // Remove surrounding quotes
            .trim();                // Remove any whitespace
        
        console.log('Cleaned service account string starts with:', cleanedServiceAccount.substring(0, 50));
        
        try {
            serviceAccount = JSON.parse(cleanedServiceAccount);
            console.log('Successfully parsed cleaned service account JSON');
        } catch (secondParseError) {
            console.log('Second parse attempt failed:', secondParseError.message);
            throw new Error(`Failed to parse service account JSON after cleaning: ${secondParseError.message}`);
        }
    }

    // Validate required fields
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    console.log('Validating required fields...');
    console.log('Found fields:', Object.keys(serviceAccount).join(', '));
    
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields in service account: ${missingFields.join(', ')}`);
    }

    console.log('Service account validated successfully');
    console.log('Initializing Firebase Admin with project:', serviceAccount.project_id);
    
    // Check if app is already initialized
    let app;
    if (getApps().length === 0) {
        app = initializeApp({
            credential: cert(serviceAccount)
        });
    } else {
        app = getApps()[0];
    }

    console.log('Firebase Admin initialized successfully');

    const db = getFirestore(app);
    const auth = getAuth(app);

    exports.handler = async (event) => {
        console.log('Received request:', event.httpMethod);
        
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: ''
            };
        }

        // Only allow POST requests
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }

        try {
            const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
            const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
            const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Admin';

            console.log('Checking super admin credentials...');
            console.log('Email configured:', !!SUPER_ADMIN_EMAIL);
            console.log('Password configured:', !!SUPER_ADMIN_PASSWORD);

            if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
                return {
                    statusCode: 500,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: 'Super admin credentials not configured',
                        details: {
                            email: !SUPER_ADMIN_EMAIL ? 'Missing SUPER_ADMIN_EMAIL' : 'Set',
                            password: !SUPER_ADMIN_PASSWORD ? 'Missing SUPER_ADMIN_PASSWORD' : 'Set'
                        }
                    })
                };
            }

            // Check if super admin already exists
            console.log('Checking if super admin exists:', SUPER_ADMIN_EMAIL);
            try {
                const userRecord = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
                console.log('Super admin already exists with UID:', userRecord.uid);
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: 'Super admin already exists',
                        uid: userRecord.uid
                    })
                };
            } catch (error) {
                // If error.code === 'auth/user-not-found' then proceed with creation
                if (error.code !== 'auth/user-not-found') {
                    console.error('Error checking super admin:', error);
                    throw error;
                }
                console.log('Super admin does not exist, proceeding with creation');
            }

            // Create the super admin user
            console.log('Creating super admin user...');
            const userRecord = await auth.createUser({
                email: SUPER_ADMIN_EMAIL,
                password: SUPER_ADMIN_PASSWORD,
                displayName: SUPER_ADMIN_NAME,
            });
            console.log('Created user with UID:', userRecord.uid);

            // Set custom claims for super admin
            console.log('Setting super admin claims...');
            await auth.setCustomUserClaims(userRecord.uid, {
                role: 'super_admin'
            });
            console.log('Super admin claims set successfully');

            // Create user document in Firestore
            console.log('Creating Firestore document...');
            await db.collection('users').doc(userRecord.uid).set({
                email: SUPER_ADMIN_EMAIL,
                name: SUPER_ADMIN_NAME,
                role: 'super_admin',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log('Firestore document created successfully');

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: 'Super admin created successfully',
                    uid: userRecord.uid
                })
            };
        } catch (error) {
            console.error('Error creating super admin:', error);
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: 'Failed to create super admin',
                    details: error.message,
                    stack: error.stack
                })
            };
        }
    };
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    
    exports.handler = async () => ({
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            error: 'Failed to initialize Firebase Admin',
            details: error.message,
            stack: error.stack
        })
    });
}
