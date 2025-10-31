import admin from 'firebase-admin';

const getServiceAccount = () => {
  const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

  if (!serviceAccountB64) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set.'
    );
  }

  // Decode the base64 string to a JSON string
  const decodedJson = Buffer.from(serviceAccountB64, 'base64').toString(
    'utf-8'
  );
  // Parse the JSON string into an object
  const serviceAccount = JSON.parse(decodedJson);

  return serviceAccount;
};

export const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = getServiceAccount();

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};
