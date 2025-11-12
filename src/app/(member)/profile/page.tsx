'use client';

import { updateDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import * as React from 'react';
import {
  useAuth,
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronRight,
  Check,
  Edit,
  HelpCircle,
  Languages,
  LogOut,
  Settings,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/providers/i18n-provider';
import { signOut } from 'firebase/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { t, locale, setLocale } = useI18n();

  const [displayName, setDisplayName] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'team_members', user.uid) : null),
    [firestore, user]
  );
  const { data: teamMember } = useDoc(userDocRef);

  const getInitials = (name?: string | null) => {
    // Use displayName state if available, as it's the most up-to-date
    if (displayName) {
      name = displayName;
    }
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  React.useEffect(() => {
    const currentName = teamMember?.name || user?.displayName || '';
    if (currentName) {
      setDisplayName(currentName);
    }
  }, [teamMember, user]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const handleNameSave = async () => {
    if (userDocRef && displayName !== (teamMember?.name || user?.displayName)) {
      try {
        await updateDoc(userDocRef, {
          name: displayName,
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating name: ', error);
      }
    }
  };

  const menuItems = [
    {
      id: 'settings',
      label: t('settings'),
      icon: Settings,
      content: (
        <div>
          <p className='text-muted-foreground mb-4'>{t('appearanceDesc')}</p>
          <ThemeToggle />
        </div>
      ),
    },
    {
      id: 'language',
      label: t('language'),
      icon: Languages,
      content: (
        <div className='space-y-2'>
          <Button
            variant={locale === 'en' ? 'default' : 'outline'}
            className='w-full justify-start'
            onClick={() => setLocale('en')}
          >
            English
          </Button>
          <Button
            variant={locale === 'th' ? 'default' : 'outline'}
            className='w-full justify-start'
            onClick={() => setLocale('th')}
          >
            ไทย
          </Button>
        </div>
      ),
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: HelpCircle,
      content: <p>Frequently Asked Questions will be displayed here.</p>,
    },
  ];

  return (
    <div className='flex flex-col h-full'>
      <div className='flex flex-col items-center gap-6 pt-4'>
        <Avatar className='h-24 w-24 border-2 border-primary'>
          <AvatarImage
            src={user?.photoURL || teamMember?.avatarUrl || ''}
            alt={user?.displayName || 'User'}
          />
          <AvatarFallback className='text-3xl'>
            {getInitials(user?.displayName || teamMember?.name)}
          </AvatarFallback>
        </Avatar>

        <div className='text-center group relative'>
          <input
            type='text'
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setIsEditing(true);
            }}
            className='text-2xl font-bold text-center bg-transparent border-none focus:ring-1 focus:ring-primary focus:rounded-md outline-none w-full max-w-xs'
            aria-label='Display Name'
          />
          {isEditing &&
          displayName !== (teamMember?.name || user?.displayName) ? (
            <Button
              variant='ghost'
              size='icon'
              className='absolute -right-10 top-1/2 -translate-y-1/2 h-8 w-8'
              onClick={handleNameSave}
            >
              <Check className='h-5 w-5 text-green-500' />
            </Button>
          ) : (
            <div className='absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity'>
              <Edit className='h-5 w-5 text-muted-foreground' />
            </div>
          )}
          <p className='text-muted-foreground'>{user?.email}</p>
        </div>
      </div>

      <div className='mt-auto w-full absolute bottom-16 p-4 left-0'>
        <Card className='w-full rounded-xl !border-0'>
          <CardContent className='p-2 !border-0'>
            <div className='w-full space-y-1'>
              {menuItems.map((item) => (
                <Sheet key={item.id}>
                  <SheetTrigger asChild>
                    <Button
                      variant='ghost'
                      className='w-full justify-between h-14 text-base'
                    >
                      <div className='flex items-center gap-4'>
                        <item.icon className='h-5 w-5 ' />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className='h-5 w-5 text-muted-foreground' />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>{item.label}</SheetTitle>
                    </SheetHeader>
                    <div className='py-4'>{item.content}</div>
                  </SheetContent>
                </Sheet>
              ))}
              <Separator />
              <Button
                variant='ghost'
                className='w-full justify-start h-14 text-base hover:text-destructive hover:bg-destructive/10'
                onClick={handleLogout}
              >
                <LogOut className='mr-4 h-5 w-5' />
                {t('logOut')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
