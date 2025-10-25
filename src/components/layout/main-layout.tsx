'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav, navItems } from '@/components/layout/sidebar-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useI18n } from '@/providers/i18n-provider';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { UserNav } from './user-nav';
import { Button } from '../ui/button';
import { Menu, Music } from 'lucide-react';
import { Separator } from '../ui/separator';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile, isClient } = useIsMobile();
  const pathname = usePathname();
  const { t } = useI18n();
  const bannerImage = placeholderImages.find((p) => p.id === 'homeBanner');

  const getPageTitle = () => {
    const currentNavItem = navItems.find((item) => item.href === pathname);
    if (currentNavItem) {
      return t(currentNavItem.labelKey as any);
    }
    if (pathname.startsWith('/settings')) return t('settings');
    return 'Prasiri Worship';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
           <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
               <SheetHeader className="border-b px-4 lg:px-6 flex h-14 items-center">
                  <SheetTitle className="flex items-center gap-2 font-semibold">
                     <Music className="h-6 w-6" />
                    <span className="">{t('prasiri')}</span>
                  </SheetTitle>
              </SheetHeader>
               <SidebarNav />
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1 lg:hidden">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                <Music className="h-6 w-6" />
                <span>{t('prasiri')}</span>
            </Link>
          </div>
          <UserNav />
        </header>
        <div className='lg:flex'>
          <Sidebar side='left' className='hidden lg:block flex-shrink-0 w-64 border-r'>
              <SidebarNav />
          </Sidebar>

          <div className='flex flex-col flex-1'>
            <main
              className={cn(
                'flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-6',
                isClient && isMobile ? 'pb-24' : 'pb-4'
              )}
            >
              {bannerImage && (
                <div className='relative w-full h-48 lg:h-64 rounded-lg overflow-hidden'>
                    <Image
                    src={bannerImage.imageUrl}
                    alt='Prasiri Worship Team Banner'
                    fill
                    className='object-cover'
                    data-ai-hint={bannerImage.imageHint}
                    />
                    <div className='absolute inset-0 bg-black/50' />
                     <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='text-center text-white'>
                        <h1 className='text-4xl font-bold'>{getPageTitle()}</h1>
                        <p className='text-lg'>Worship Team Management</p>
                        </div>
                    </div>
                </div>
              )}
              <div className='flex-1'>{children}</div>
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
