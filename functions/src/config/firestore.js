const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('../../../firebase-service-account.json');

const SERVICE_PATH = process.env.FIREBASE_SERVICE_PATH || '[ZONE]-firestore.googleapis.com';
const DATABASE_ID  = process.env.FIREBASE_DB_ID || 'fallback-value-database';

const db = new Firestore({
  projectId: serviceAccount.project_id,
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key
  },
  databaseId: DATABASE_ID,
  servicePath: SERVICE_PATH,
  apiEndpoint: SERVICE_PATH
});

console.log('[Firestore] servicePath=', SERVICE_PATH, ' databaseId=', DATABASE_ID);
module.exports = { db };
