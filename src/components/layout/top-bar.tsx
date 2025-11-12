'use client';

import * as React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

interface TopBarProps {
  children?: React.ReactNode;
  notificationCount?: number;
}

export function TopBar({ children, notificationCount = 1 }: TopBarProps) {
  const { title, subTitle } = useSelector(
    (state: RootState) => state.layout.header
  );
  const notifications = [
    { id: 1, message: 'You have been assigned to the service on Sunday.' },
    { id: 2, message: 'New song "Amazing Grace" has been added.' },
    { id: 3, message: 'Reminder: Team meeting tomorrow at 7 PM.' },
  ];

  return (
    <header className='sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-4  bg-background px-4 lg:h-[60px]'>
      <div className='flex-1'>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
          {title}
        </h1>
      </div>
      <div className='flex items-center gap-4'>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant='default'
              size='icon'
              className='relative rounded-full'
            >
              <Bell className='h-5 w-5' />
              {notificationCount > 0 && (
                <Badge className='absolute top-2 right-[9px] h-[5px] w-[5px] rounded-full bg-red-400 p-0'>
                  {/* Dot indicator */}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className='w-full max-w-xs p-0'>
            <SheetHeader className='p-4 border-b'>
              <SheetTitle>Notifications</SheetTitle>
            </SheetHeader>
            <div className='p-4 space-y-4'>
              {notifications.map((notification, index) => (
                <div key={notification.id} className='text-sm'>
                  <p>{notification.message}</p>
                  {index < notifications.length - 1 && (
                    <Separator className='mt-4' />
                  )}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
