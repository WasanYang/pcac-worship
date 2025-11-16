'use client';

import { useI18n } from '@/providers/i18n-provider';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  useFirestore,
  useDoc,
  useMemoFirebase,
  useCollection,
} from '@/firebase';
import { doc, Timestamp, collection, query, where } from 'firebase/firestore';
import type { Service, TeamMember, Song } from '@/lib/placeholder-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, User, ListMusic, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ServiceDetailPage() {
  const { t, locale } = useI18n();
  const params = useParams();
  const serviceId = params.id as string;

  const firestore = useFirestore();
  const serviceRef = useMemoFirebase(
    () =>
      firestore && serviceId ? doc(firestore, 'services', serviceId) : null,
    [firestore, serviceId]
  );
  const { data: service, isLoading: isLoadingService } =
    useDoc<Service>(serviceRef);

  const teamMemberIds = useMemo(() => {
    if (!service) return [];
    const ids = new Set<string>();
    if (service.worshipLeaderId) {
      ids.add(service.worshipLeaderId);
    }
    service.teams?.forEach((member) => ids.add(member));
    return Array.from(ids);
  }, [service]);

  const songIds = useMemo(() => {
    if (!service || !service.songs) return [];
    return service.songs.map((song) => song);
  }, [service]);

  const { data: teamMembers, isLoading: isLoadingTeam } =
    useCollection<TeamMember>(
      useMemoFirebase(
        () =>
          firestore && teamMemberIds.length > 0
            ? query(
                collection(firestore, 'team_members'),
                where('id', 'in', teamMemberIds)
              )
            : null,
        [firestore, teamMemberIds]
      )
    );

  const { data: songs, isLoading: isLoadingSongs } = useCollection<Song>(
    useMemoFirebase(
      () =>
        firestore && songIds.length > 0
          ? query(collection(firestore, 'songs'), where('id', 'in', songIds))
          : null,
      [firestore, songIds]
    )
  );

  const worshipLeader = teamMembers?.find(
    (m) => m.id === service?.worshipLeaderId
  );
  const isLoading = isLoadingService || isLoadingTeam || isLoadingSongs;

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent'></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className='flex flex-col items-center justify-center text-center gap-4'>
        <h2 className='text-2xl font-semibold'>{t('serviceNotFound')}</h2>
        <p>{t('serviceNotFoundDesc')}</p>
        <Button asChild>
          <Link href='/services'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('backToServices')}
          </Link>
        </Button>
      </div>
    );
  }

  const serviceDate =
    service.date instanceof Timestamp
      ? service.date.toDate()
      : new Date(service.date);

  return (
    <div className='flex flex-col gap-8'>
      <Button variant='outline' size='sm' className='self-start' asChild>
        <Link href='/services'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          {t('backToServices')}
        </Link>
      </Button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-1 flex flex-col gap-6'>
          <Card className='overflow-hidden'>
            <div className='relative w-full h-60'>
              <Image
                src={service.imageUrl || '/placeholder.svg'}
                alt={service.theme}
                fill
                className='object-cover'
              />
            </div>
            <CardHeader>
              <CardTitle className='text-xl md:text-2xl'>
                {service.theme}
              </CardTitle>
              <CardDescription>{service.sermonTheme}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Calendar className='h-4 w-4' />
                <span>
                  {serviceDate.toLocaleDateString(locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <User className='h-4 w-4' />
                <span>
                  {t('ledBy')}{' '}
                  <span className='font-semibold text-foreground'>
                    {worshipLeader?.name || '...'}
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='lg:col-span-2 flex flex-col gap-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle className='text-xl md:text-2xl flex items-center gap-2'>
                  <ListMusic /> {t('setlist')}
                </CardTitle>
                <CardDescription>{t('setlistDesc')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {songs && songs.length > 0 ? (
                <ul className='space-y-3'>
                  {songs.map((song, index) => (
                    <li
                      key={song.id}
                      className='flex items-center justify-between p-2 rounded-md hover:bg-muted/50'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='text-sm font-bold text-muted-foreground w-6 text-center'>
                          {index + 1}.
                        </span>
                        <p className='font-medium'>{song.title}</p>
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {t('key')}: {song.key}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-muted/50'>
                  <ListMusic className='h-12 w-12 text-muted-foreground mb-4' />
                  <h3 className='text-lg font-semibold'>{t('noSongsAdded')}</h3>
                  <p className='text-sm text-muted-foreground'>
                    {t('noSongsAddedDesc')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle className='text-xl md:text-2xl flex items-center gap-2'>
                  <Users /> {t('team.title')}
                </CardTitle>
                <CardDescription>{t('teamDesc')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {teamMembers && teamMembers.length > 0 ? (
                <ul className='space-y-4'>
                  {teamMembers.map((member) => (
                    <li key={member.id} className='flex items-center gap-4'>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-grow'>
                        <p className='font-semibold'>{member.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {member.id === service.worshipLeaderId
                            ? t('worshipLeader')
                            : Array.isArray(member.role)
                            ? member.role.join(', ')
                            : member.role}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-muted/50'>
                  <Users className='h-12 w-12 text-muted-foreground mb-4' />
                  <h3 className='text-lg font-semibold'>
                    {t('noTeamScheduled')}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {t('noTeamScheduledDesc')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
