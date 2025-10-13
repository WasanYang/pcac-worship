'use client';

import { ThemeProvider } from '@/providers/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { I18nProvider } from '@/providers/i18n-provider';
import MainLayout from '@/components/layout/main-layout';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser } from '@/firebase';
import LoginPage from '@/app/login/page';
import { useEffect, useState } from 'react';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isUserLoading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
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
