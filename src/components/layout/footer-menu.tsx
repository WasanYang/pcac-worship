import { cn } from '@/lib/utils';
import { useI18n } from '@/providers/i18n-provider';
import {
  LayoutDashboard,
  ListMusic,
  Calendar,
  Users,
  HeartHandshake,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const navItems = [
  { href: '/', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/services', labelKey: 'services', icon: Calendar },
  { href: '/team', labelKey: 'team', icon: Users },
  { href: '/profile', labelKey: 'profile', icon: User },

  //   { href: '/songs', labelKey: 'songs', icon: ListMusic },
  //   { href: '/accountability', labelKey: 'accountability', icon: HeartHandshake },
];

export function FooterMenu() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className='pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center'>
      <div className='pointer-events-auto w-full max-w-3xl border-t bg-background/95 backdrop-blur-sm'>
        <div className='grid h-16 grid-cols-4 items-center justify-items-center gap-4 px-4'>
          {navItems.map((item) => {
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
    </div>
  );
}
