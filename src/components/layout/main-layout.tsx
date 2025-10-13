'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { navItems } from '@/components/layout/sidebar-nav';
import { useI18n } from '@/providers/i18n-provider';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile, isClient } = useIsMobile();
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <SidebarProvider>
      <div className='flex min-h-screen w-full flex-col bg-muted/40'>
        <Header />
        <div className='flex flex-1'>
          <Sidebar side='left' collapsible='none' className='hidden sm:flex'>
            <SidebarNav />
          </Sidebar>
          <main
            className={cn(
              'flex-1 gap-4 p-4 sm:pl-72 sm:pt-6 md:gap-6',
              isClient && isMobile ? 'pb-24' : 'pb-4'
            )}
          >
            {children}
          </main>
        </div>
        {isClient && isMobile && (
          <div className='fixed bottom-0 left-0 z-40 w-full border-t bg-background/95 backdrop-blur-sm'>
            <div className='grid h-16 grid-cols-4 items-center justify-items-center gap-4 px-4'>
              {navItems.slice(0, 4).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 text-muted-foreground',
                      isActive && 'text-primary'
                    )}
                  >
                    <item.icon className='h-5 w-5' />
                    <span className='text-[11px] font-medium'>
                      {t(item.labelKey as any)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
