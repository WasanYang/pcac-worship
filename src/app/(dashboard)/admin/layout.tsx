'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserNav } from '@/components/layout/user-nav';
import {
  Music,
  Users,
  LayoutDashboard,
  UsersRound,
  HeartHandshake,
  CalendarDays,
  Music2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/providers/i18n-provider';

const adminNavItems = [
  { href: '/admin', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/admin/users', icon: Users, labelKey: 'user' },
  { href: '/admin/teams', icon: UsersRound, labelKey: 'team.title' },
  {
    href: '/admin/peer-groups',
    icon: HeartHandshake,
    labelKey: 'peer_groups.admin.title',
  },
  { href: '/admin/songs', icon: Music2, labelKey: 'songs' },
  { href: '/admin/services', icon: CalendarDays, labelKey: 'services' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <div className='min-h-screen w-full'>
      <header className='sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6'>
        <Link
          href='/'
          className='flex items-center gap-2 font-semibold text-lg'
        >
          <Music className='h-6 w-6' />
          <span className='sr-only lg:not-sr-only'>{t('prasiri')} - Admin</span>
        </Link>
        <UserNav />
      </header>
      <div className='lg:flex'>
        <aside className='hidden lg:block flex-shrink-0 w-64 border-r'>
          <div className='flex h-full max-h-screen flex-col gap-2'>
            <div className='flex-1'>
              <nav className='grid items-start px-2 text-sm font-medium lg:px-4 mt-4'>
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                      pathname === item.href && 'bg-muted text-primary'
                    )}
                  >
                    <item.icon className='h-4 w-4' />
                    {t(item.labelKey as any)}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>
        <main className='flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
          {children}
        </main>
      </div>
    </div>
  );
}
