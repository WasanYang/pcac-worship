'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { navItems } from '@/components/layout/sidebar-nav';
import { useI18n } from '@/providers/i18n-provider';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { UserNav } from './user-nav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile, isClient } = useIsMobile();
  const pathname = usePathname();
  const { t } = useI18n();
  const bannerImage = placeholderImages.find((p) => p.id === 'homeBanner');

  return (
    <SidebarProvider>
      <div className='relative min-h-screen w-full flex-col bg-muted/40'>
        <UserNav />
        <div className='relative h-64 w-full'>
          {bannerImage && (
            <Image
              src={bannerImage.imageUrl}
              alt='Prasiri Worship Team Banner'
              fill
              className='object-cover'
              data-ai-hint={bannerImage.imageHint}
            />
          )}
          <div className='absolute inset-0 bg-black/50' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center text-white'>
              <h1 className='text-4xl font-bold'>Prasiri Worship</h1>
              <p className='text-lg'>Worship Team Management</p>
            </div>
          </div>
        </div>

        <div className='flex flex-1'>
          <Sidebar side='left' collapsible='none' className='top-48 mt-[-3.5rem]'>
            <SidebarNav />
          </Sidebar>
          <div className="flex-1 sm:pl-64 flex flex-col">
            <main
              className={cn(
                'flex-1 gap-4 p-4 md:gap-6',
                isClient && isMobile ? 'pb-24' : 'pb-4'
              )}
            >
              {children}
            </main>
          </div>
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
