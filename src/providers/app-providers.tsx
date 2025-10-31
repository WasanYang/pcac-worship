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
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isRedirectLoading, setIsRedirectLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const checkRedirect = async () => {
      if (!auth) {
        setIsRedirectLoading(false);
        return;
      }
      try {
        // This will complete the sign-in process after a redirect.
        // The onAuthStateChanged listener in FirebaseProvider will then handle
        // creating the user document if it's their first time.
        await getRedirectResult(auth);
      } catch (error) {
        console.error('Error handling redirect result:', error);
        let description = 'An unexpected error occurred during Google Sign-In.';
        if (error instanceof FirebaseError) {
          description = error.message;
        }
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description,
        });
      } finally {
        setIsRedirectLoading(false);
      }
    };

    checkRedirect();
  }, [auth, toast]);

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

  return <>{children}</>;
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
