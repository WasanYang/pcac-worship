'use client';

import { getAuth, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

export async function signInWithGoogle() {
  const { auth } = initializeFirebase();
  const provider = new GoogleAuthProvider();
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('Error signing in with Google: ', error);
  }
}
