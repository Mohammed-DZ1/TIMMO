const fs = require('fs');
const path = require('path');

// Read the service account file
const serviceAccountPath = path.join(__dirname, '..', '..', 'timmo-2f70c-firebase-adminsdk-fbsvc-812395bf10.json');
const serviceAccount = require(serviceAccountPath);

// Convert to a single line and properly escape
const formatted = JSON.stringify(serviceAccount);
console.log(formatted);
