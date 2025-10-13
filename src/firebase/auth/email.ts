'use client';

import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import type { Role } from '@/lib/placeholder-data';

export async function signUpWithEmail(auth: Auth, email: string, password: string, role: Role = 'Team Member') {
  const { firestore } = getSdks(auth.app);
  
  // Note: This creates the user in a separate auth context. The main app's
  // onAuthStateChanged will not fire for this user until they log in.
  // To avoid complexity, we are not auto-logging in the newly created user for the admin.
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const displayName = email.split('@')[0];
  await updateProfile(user, { displayName });

  const userDocRef = doc(firestore, 'team_members', user.uid);
  await setDoc(userDocRef, {
    id: user.uid,
    userId: user.uid,
    name: displayName,
    email: user.email,
    role: role,
    avatarUrl: `https://picsum.photos/seed/${user.uid}/100/100`
  });

  return userCredential;
}

export async function signInWithEmail(auth: Auth, email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}
