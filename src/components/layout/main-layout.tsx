'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation'; // SidebarProvider and Sidebar are not used anymore
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useI18n } from '@/providers/i18n-provider';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { TopBar } from './top-bar';
import { FooterMenu, navItems } from './footer-menu';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile, isClient } = useIsMobile();
  const { currentUser: user } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const isWelcomePage = pathname === '/welcome';

  React.useEffect(() => {
    const checkUserStatus = async () => {
      // ไม่ต้องตรวจสอบถ้ายังไม่มี user, firestore หรือถ้าอยู่ที่หน้า welcome อยู่แล้ว
      if (!user || !firestore || isWelcomePage) {
        return;
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // ถ้าข้อมูล user ไม่มีในระบบ หรือ status ไม่ใช่ 'approved' ให้ redirect
      if (!userDocSnap.exists() || userDocSnap.data()?.status !== 'approved') {
        router.push('/welcome');
      }
    };

    checkUserStatus();
  }, [user, firestore, pathname, router, isWelcomePage]);

  const { t } = useI18n();
  const bannerImages = placeholderImages.filter(
    (p) => p.id.startsWith('homeBanner') || p.id.startsWith('service')
  );

  const getPageTitle = () => {
    const currentNavItem = navItems.find((item) => item.href === pathname);
    if (currentNavItem) {
      return t(currentNavItem.labelKey as any);
    }
    if (pathname.startsWith('/settings')) return t('settings');
    if (pathname.startsWith('/team/')) return t('team');
    if (pathname.startsWith('/admin')) return t('admin');
    return 'Worship Flow';
  };

  return (
    <div className='min-h-screen w-full bg-gradient-to-t from-secondary from-70% to-background'>
      <div className='mx-auto flex max-w-3xl flex-col'>
        <TopBar />
        <div className='flex w-full flex-col flex-1'>
          {/* {bannerImages.length > 0 && (
            <div className='w-full p-4 pb-0 md:p-6 md:pb-0'>
              <Carousel
                opts={{
                  loop: true,
                }}
                className='w-full'
              >
                <CarouselContent className='-ml-0'>
                  {bannerImages.map((image, index) => (
                    <CarouselItem key={index} className='pl-0'>
                      <div className='relative w-full h-48 lg:h-64 lg:rounded-lg overflow-hidden'>
                        <Image
                          src={image.imageUrl}
                          alt={image.description || 'Banner image'}
                          fill
                          className='object-cover'
                          data-ai-hint={image.imageHint}
                        />
                        <div className='absolute inset-0 bg-black/50' />
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <div className='text-center text-white'>
                            <h1 className='text-3xl md:text-4xl font-bold'>
                              {getPageTitle()}
                            </h1>
                            <p className='text-base md:text-lg'>
                              Worship Team Management
                            </p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          )} */}
          <main
            className={cn(
              'flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 h-full',
              isClient && isMobile ? 'pb-24' : 'pb-4',
              !bannerImages.length && 'pt-6'
            )}
          >
            <div className='flex-1 h-full'>{children}</div>
          </main>
        </div>
      </div>
      {isClient && !isWelcomePage && <FooterMenu />}
    </div>
  );
}
