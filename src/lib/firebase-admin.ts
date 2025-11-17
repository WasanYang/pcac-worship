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
    storageBucket: 'studio-7303019413-59816.firebasestorage.app',
  });
};

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(getServiceAccount()),
      storageBucket: 'studio-7303019413-59816.firebasestorage.app',
    });
  }
} catch (error) {
  console.error('Firebase Admin initialization error: ', error);
  if ((error as any).code === 'MODULE_NOT_FOUND') {
    console.error(
      '\n*** Firebase Admin SDK Service Account key not found. ***'
    );
    console.error(
      "Please download your service account key from the Firebase console and place it as 'serviceAccountKey.json' in the root of your project."
    );
    console.error(
      'The gallery page will not be able to load images from Storage without it.\n'
    );
  }
}

// export const adminDb = admin.apps.length ? admin.firestore() : undefined;
export const adminStorage = admin.apps.length ? admin.storage() : undefined;
