'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartHandshake, ListMusic, Users, CalendarDays } from 'lucide-react';
import {
  recentSongs,
  upcomingServices,
  teamMembers,
  accountabilityGroups,
} from '@/lib/placeholder-data';
import { useI18n } from '@/providers/i18n-provider';

export default function Dashboard() {
  const { t } = useI18n();

  return (
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('totalSongs')}
            </CardTitle>
            <ListMusic className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{recentSongs.length}</div>
            <p className='text-xs text-muted-foreground'>
              {t('inYourLibrary')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('upcomingServices')}
            </CardTitle>
            <CalendarDays className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{upcomingServices.length}</div>
            <p className='text-xs text-muted-foreground'>{t('thisMonth')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('teamMembers')}
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{teamMembers.length}</div>
            <p className='text-xs text-muted-foreground'>
              {t('activeInTheTeam')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('activeGroups')}
            </CardTitle>
            <HeartHandshake className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {accountabilityGroups.length}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('forPeerAccountability')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingServices')}</CardTitle>
            <CardDescription>{t('upcomingServicesDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-4 md:grid-cols-3'>
            {upcomingServices.slice(0, 6).map((service) => (
              <div key={service.id} className='space-y-2'>
                <div className='overflow-hidden rounded-md'>
                  <Image
                    src={service.imageUrl}
                    alt={service.theme}
                    width={300}
                    height={300}
                    className='aspect-square w-full object-cover transition-transform hover:scale-105'
                    data-ai-hint='worship service'
                  />
                </div>
                <div>
                  <h3 className='font-semibold truncate'>{service.theme}</h3>
                  <p className='text-xs text-muted-foreground'>
                    {service.date}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('recentlyAddedSongs')}</CardTitle>
            <CardDescription>{t('recentlyAddedSongsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentSongs.slice(0, 5).map((song) => (
                <div key={song.id} className='flex items-center'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground'>
                    <ListMusic className='h-5 w-5' />
                  </div>
                  <div className='ml-4 space-y-1'>
                    <p className='text-sm font-medium leading-none'>
                      {song.title}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {song.author}
                    </p>
                  </div>
                  <div className='ml-auto font-medium'>{song.key}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
