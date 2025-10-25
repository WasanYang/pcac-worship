'use client';

import { ThemeProvider } from '@/providers/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { I18nProvider } from '@/providers/i18n-provider';
import MainLayout from '@/components/layout/main-layout';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser, useAuth } from '@/firebase';
import LoginPage from '@/app/login/page';
import { useEffect, useState } from 'react';
import { getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isClient, setIsClient] = useState(false);
  const [isRedirectLoading, setIsRedirectLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const checkRedirect = async () => {
      if (!auth || !firestore) {
        setIsRedirectLoading(false);
        return;
      }
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const firebaseUser = result.user;
          // This logic is now duplicated from the provider, which is not ideal, but necessary
          // to ensure the user document is created on the very first sign-in via redirect.
          const userDocRef = doc(firestore, 'team_members', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
              id: firebaseUser.uid,
              userId: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email,
              role: 'Team Member',
              avatarUrl:
                firebaseUser.photoURL ||
                `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
            });
          }
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      } finally {
          setIsRedirectLoading(false);
      }
    };

    checkRedirect();
  }, [auth, firestore]);

  if (isUserLoading || isRedirectLoading || !isClient) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent'></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <MainLayout>{children}</MainLayout>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <TooltipProvider>
        <I18nProvider>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <AppContent>{children}</AppContent>
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
      </TooltipProvider>
    </FirebaseClientProvider>
  );
}
