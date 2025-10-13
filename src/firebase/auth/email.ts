'use client';

import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase';

export async function signUpWithEmail(auth: Auth, email: string, password: string) {
  const { firestore } = getSdks(auth.app);
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Set the user's name to be the part of the email before the @ symbol
  const displayName = email.split('@')[0];
  await updateProfile(user, { displayName });

  // Create a new team_member document in Firestore
  const userDocRef = doc(firestore, 'team_members', user.uid);
  await setDoc(userDocRef, {
    id: user.uid,
    userId: user.uid,
    name: displayName,
    email: user.email,
    role: 'Team Member', // Default role
  });

  return userCredential;
}

export async function signInWithEmail(auth: Auth, email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}
