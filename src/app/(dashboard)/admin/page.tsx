'use client';

import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
  Music,
  Calendar,
  BarChart,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { User } from '@/lib/features/user/user-api';
import { Service, Song } from '@/lib/placeholder-data';
// import { Song } from '@/lib/features/songs/songs-api';
// import { Service } from '@/lib/features/services/services-api';

export default function AdminPage() {
  const { t } = useI18n();
  const firestore = useFirestore();

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

  const pendingUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((user) => user.status === 'pending');
  }, [allUsers]);

  const stats = [
    {
      title: 'Total Users',
      icon: Users,
      value: allUsers?.length ?? 0,
      isLoading: isLoadingUsers,
    },
    {
      title: 'Total Songs',
      icon: Music,
      value: allSongs?.length ?? 0,
      isLoading: isLoadingSongs,
    },
    {
      title: 'Total Services',
      icon: Calendar,
      value: allServices?.length ?? 0,
      isLoading: isLoadingServices,
    },
    {
      title: 'Pending Approvals',
      icon: Users,
      value: pendingUsers.length,
      isLoading: isLoadingUsers,
      className: 'text-yellow-600',
    },
  ];

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

  return (
    <div className='flex flex-col gap-8'>
      <div>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
          {t('admin')} Dashboard
        </h1>
        <p className='text-muted-foreground'>
          An overview of your worship management system.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {stat.title}
              </CardTitle>
              <stat.icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {stat.isLoading ? (
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              ) : (
                <div className={`text-2xl font-bold ${stat.className || ''}`}>
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-8 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Services</CardTitle>
            <CardDescription>
              The next 5 scheduled worship services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingServices ? (
              <div className='flex justify-center items-center h-40'>
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              </div>
            ) : servicesError ? (
              <div className='flex flex-col items-center justify-center h-40 text-destructive'>
                <AlertCircle className='h-8 w-8 mb-2' />
                <p>Error loading services.</p>
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
                      <TableCell>{service.worshipLeaderName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className='text-center text-muted-foreground py-10'>
                No upcoming services.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Recent activities in the system.</CardDescription>
          </CardHeader>
          <CardContent className='flex items-center justify-center h-full'>
            <div className='text-center text-muted-foreground'>
              <BarChart className='mx-auto h-12 w-12 mb-4' />
              <p>Activity chart coming soon.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
