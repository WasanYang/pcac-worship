'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  useFirestore,
  useDoc,
  useMemoFirebase,
  useUser,
  useCollection,
} from '@/firebase';
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  documentId,
} from 'firebase/firestore';
import type { TeamMember, Service } from '@/lib/placeholder-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Target, ArrowLeft, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/providers/i18n-provider';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function TeamMemberDetailPage() {
  const { t, locale } = useI18n();
  const params = useParams();
  const memberId = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();

  const teamMemberRef = useMemoFirebase(
    () =>
      firestore && memberId ? doc(firestore, 'team_members', memberId) : null,
    [firestore, memberId]
  );
  const { data: teamMember, isLoading } = useDoc<TeamMember>(teamMemberRef);
  const upcomingServicesQuery = useMemoFirebase(
    () =>
      firestore && memberId
        ? query(
            collection(firestore, 'services'),
            where('date', '>=', new Date()),
            orderBy('date', 'asc')
          )
        : null,
    [firestore, memberId]
  );
  const { data: upcomingServices, isLoading: isLoadingServices } =
    useCollection<Service>(upcomingServicesQuery);
  const userRoles = Array.isArray(teamMember?.role)
    ? teamMember.role
    : teamMember?.role
    ? [teamMember.role]
    : [];
  const skills = teamMember?.skills || [];

  if (isLoading || isLoadingServices) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent'></div>
      </div>
    );
  }

  if (!teamMember) {
    return (
      <div className='text-center'>
        <h2 className='text-xl md:text-2xl font-semibold'>
          {t('teamMemberNotFound')}
        </h2>
        <p>{t('teamMemberNotFoundDesc')}</p>
        <Button asChild className='mt-4'>
          <Link href='/team'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('backToTeam')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-8'>
      <Button variant='outline' size='sm' className='self-start' asChild>
        <Link href='/team'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          {t('backToTeam')}
        </Link>
      </Button>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader className='items-center text-center'>
              <Avatar className='w-24 h-24 mb-4'>
                <AvatarImage src={teamMember.avatarUrl} alt={teamMember.name} />
                <AvatarFallback>
                  {teamMember.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle className='text-xl md:text-2xl'>
                {teamMember.name}
              </CardTitle>
              <div className='flex flex-wrap justify-center gap-1 pt-2'>
                {userRoles.map((role) => (
                  <Badge key={role} variant='secondary'>
                    {role}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className='text-sm text-muted-foreground'>
              <div className='flex items-center gap-3'>
                <Mail className='w-4 h-4' />
                <span>{teamMember.email}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='lg:col-span-2 flex flex-col gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Target className='h-5 w-5' />
                {t('skills')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <div key={skill.skill} className='space-y-1'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>{skill.skill}</span>
                      <span className='text-xs text-muted-foreground'>
                        {skill.progress}%
                      </span>
                    </div>
                    <Progress value={skill.progress} className='h-2' />
                  </div>
                ))
              ) : (
                <p className='text-sm text-muted-foreground italic'>
                  {t('noSkillsForMember')}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <CalendarDays className='h-5 w-5' />
                {t('upcomingServices')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingServices && upcomingServices.length > 0 ? (
                <ul className='space-y-3'>
                  {upcomingServices.map((service) => (
                    <li key={service.id}>
                      <Link href={`/services/${service.id}`}>
                        <div className='p-2 rounded-md hover:bg-muted/50'>
                          <p className='font-medium'>{service.theme}</p>
                          <p className='text-sm text-muted-foreground'>
                            {new Date(
                              service.date.seconds * 1000
                            ).toLocaleDateString(locale, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-muted-foreground italic'>
                  {t('noUpcomingServicesForMember')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
