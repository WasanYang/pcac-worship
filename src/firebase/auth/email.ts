'use client';

import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import type { Role } from '@/lib/placeholder-data';

export async function signUpWithEmail(
  auth: Auth,
  email: string,
  password: string
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const displayName = email.split('@')[0];
  // Update the profile in Firebase Auth.
  // The creation of the user document in Firestore is now handled by FirebaseProvider.
  await updateProfile(userCredential.user, { displayName });

  return userCredential;
}

export async function signInWithEmail(
  auth: Auth,
  email: string,
  password: string
) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/popup-blocked') {
      console.warn('Pop-up was blocked, falling back to redirect method.');
      await signInWithRedirect(auth, provider);
    }
    // Re-throw other errors so they can be handled by the calling component
    throw error;
  }
}

export async function signUpWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    // The user document creation logic (with 'pending' status) is handled by FirebaseProvider on auth state change.
    await signInWithPopup(auth, provider);
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/popup-blocked') {
      console.warn('Pop-up was blocked, falling back to redirect method.');
      await signInWithRedirect(auth, provider);
    }
    throw error;
  }
}
