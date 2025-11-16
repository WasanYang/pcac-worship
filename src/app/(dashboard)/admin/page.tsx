'use client';

import { collection } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useI18n } from '@/providers/i18n-provider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  // LibraryMusic,
  CalendarDays,
  Loader2,
  AlertCircle,
  UserCheck,
  ArrowRight,
  Music2,
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { User, useUpdateUserMutation } from '@/lib/features/user/user-api';
import { Service, Song, TeamMember } from '@/lib/placeholder-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const { t } = useI18n();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [updateUser] = useUpdateUserMutation();
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);

  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<User>(
    useMemoFirebase(
      () => (firestore ? collection(firestore, 'users') : null),
      [firestore]
    )
  );
  const { data: allSongs, isLoading: isLoadingSongs } = useCollection<Song>(
    useMemoFirebase(
      () => (firestore ? collection(firestore, 'songs') : null),
      [firestore]
    )
  );
  const {
    data: allServices,
    isLoading: isLoadingServices,
    error: servicesError, // Keep error for services to show in the UI
  } = useCollection<Service>(
    useMemoFirebase(
      () => (firestore ? collection(firestore, 'services') : null),
      [firestore]
    )
  );
  const { data: allTeamMembers, isLoading: isLoadingTeamMembers } =
    useCollection<TeamMember>(
      useMemoFirebase(
        () => (firestore ? collection(firestore, 'team_members') : null),
        [firestore]
      )
    );

  const pendingUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((user) => user.status === 'pending');
  }, [allUsers]);

  const stats = [
    {
      title: t('user'),
      icon: Users,
      value: allUsers?.length ?? 0,
      isLoading: isLoadingUsers,
      href: '/admin/users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: t('songs'),
      icon: Music2,
      value: allSongs?.length ?? 0,
      isLoading: isLoadingSongs,
      href: '/admin/songs',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: t('services'),
      icon: CalendarDays,
      value: allServices?.length ?? 0,
      isLoading: isLoadingServices,
      href: '/admin/services',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: t('pending'),
      icon: UserCheck,
      value: pendingUsers.length,
      isLoading: isLoadingUsers,
      href: '/admin/users',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const teamMembersMap = useMemo(() => {
    if (!allTeamMembers) return new Map();
    return new Map(allTeamMembers.map((member) => [member.id, member]));
  }, [allTeamMembers]);

  const upcomingServices = useMemo(() => {
    if (!allServices) return [];
    const now = new Date();
    return [...allServices]
      .filter((service) => new Date(service.date.toDate()) >= now)
      .sort(
        (a, b) =>
          new Date(a.date.toDate()).getTime() -
          new Date(b.date.toDate()).getTime()
      )
      .slice(0, 5);
  }, [allServices]);

  const handleApproveUser = async (user: User) => {
    setApprovingUserId(user.uid);
    try {
      await updateUser({ uid: user.uid, payload: { status: 'approved' } });
      toast({
        title: t('admin_users_approve_success_title'),
        description: t('admin.users.approve_success_desc', {
          name: user.displayName || user.email || '',
        }),
      });
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        variant: 'destructive',
        title: t('admin.users.approve_failed_title'),
        description: t('admin.users.approve_failed_desc'),
      });
    } finally {
      setApprovingUserId(null);
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      <div>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
          {t('admin.dashboard.title')}
        </h1>
        <p className='text-muted-foreground'>
          {t('admin.dashboard.description')}
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className='hover:bg-muted/50 transition-colors'
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {stat.title}
              </CardTitle>
              <div className={cn('p-1.5 rounded-md', stat.bgColor)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              {stat.isLoading ? (
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              ) : (
                <div className={cn('text-2xl font-bold', stat.color)}>
                  {stat.value}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link
                href={stat.href}
                className='text-xs text-muted-foreground flex items-center hover:text-primary'
              >
                {t('view_all')} <ArrowRight className='h-3 w-3 ml-1' />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className='grid gap-8 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>{t('myUpcomingServices')}</CardTitle>
            <CardDescription>{t('upcoming_services_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingServices || isLoadingTeamMembers ? (
              <div className='flex justify-center items-center h-40'>
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              </div>
            ) : servicesError ? (
              <div className='flex flex-col items-center justify-center h-40 text-destructive'>
                <AlertCircle className='h-8 w-8 mb-2' />
                <p>{t('admin.dashboard.error_loading')}</p>
              </div>
            ) : upcomingServices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Leader</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className='font-medium'>
                        {service.theme}
                      </TableCell>
                      <TableCell>
                        {new Date(service.date.toDate()).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {teamMembersMap.get(service.worshipLeaderId)?.name ||
                          'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className='text-center text-muted-foreground py-10'>
                {t('admin.dashboard.no_upcoming_services')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('pending')}</CardTitle>
            <CardDescription>{t('pending_approvals_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className='flex justify-center items-center h-40'>
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              </div>
            ) : pendingUsers.length > 0 ? (
              <div className='space-y-4'>
                {pendingUsers.slice(0, 5).map((user) => (
                  <div key={user.uid} className='flex items-center'>
                    <Avatar className='h-9 w-9'>
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback>
                        {user.displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='ml-4 space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        {user.displayName}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {user.email}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleApproveUser(user)}
                      size='sm'
                      className='ml-auto'
                      disabled={approvingUserId === user.uid}
                    >
                      {approvingUserId === user.uid ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        t('admin_approve')
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center text-muted-foreground py-10'>
                {t('pending')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
