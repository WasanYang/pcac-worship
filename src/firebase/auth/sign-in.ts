'use client';

import { Auth, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    // We don't need to await this, as the redirect will take over.
    // The user's auth state will be updated by the onAuthStateChanged listener in the provider.
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('Error signing in with Google: ', error);
  }
}
