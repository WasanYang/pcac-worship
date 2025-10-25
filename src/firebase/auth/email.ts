'use client';

import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithRedirect
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import type { Role } from '@/lib/placeholder-data';

export async function signUpWithEmail(auth: Auth, email: string, password: string, roles: Role[] = ['Team Member']) {
  const { firestore } = getSdks(auth.app);
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const displayName = email.split('@')[0];
  await updateProfile(user, { displayName });

  // Create document in 'team_members' collection
  const teamMemberDocRef = doc(firestore, 'team_members', user.uid);
  await setDoc(teamMemberDocRef, {
    id: user.uid,
    userId: user.uid,
    name: displayName,
    email: user.email,
    role: roles,
    avatarUrl: `https://picsum.photos/seed/${user.uid}/100/100`
  });

  // If the role is Admin, also create a document in 'user_roles' collection
  if (roles.includes('Admin')) {
    const userRoleDocRef = doc(firestore, 'user_roles', user.uid);
    await setDoc(userRoleDocRef, {
      id: user.uid,
      userId: user.uid,
      role: 'Admin',
      permissions: [] // You can define specific permissions later
    });
  }

  return userCredential;
}

export async function signInWithEmail(auth: Auth, email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  return await signInWithRedirect(auth, provider);
}
