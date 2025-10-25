'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HeartHandshake,
  ListMusic,
  Users,
  CalendarDays,
  User,
  Target,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import {
  doc,
  collection,
  query,
  where,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type {
  Service,
  TeamMember,
  AccountabilityGroup,
  Schedule,
} from '@/lib/placeholder-data';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Dashboard() {
  const { t } = useI18n();
  const { user } = useUser();
  const firestore = useFirestore();

  const teamMemberRef = useMemoFirebase(
    () => (user ? doc(firestore, 'team_members', user.uid) : null),
    [firestore, user]
  );
  const { data: teamMember } = useDoc<TeamMember>(teamMemberRef);

  const servicesAsLeaderQuery = useMemoFirebase(() => {
    if (!user) return null;
    const now = new Date();
    return query(
      collection(firestore, 'services'),
      where('worshipLeaderId', '==', user.uid),
      where('date', '>=', now.toISOString()),
      limit(5)
    );
  }, [firestore, user]);

  const servicesAsTeamMemberQuery = useMemoFirebase(() => {
    if (!user) return null;
    const now = new Date();
    return query(
      collection(firestore, 'services'),
      // where('team', 'array-contains', user.uid),
      where('date', '>=', now.toISOString()),
      limit(5)
    );
  }, [firestore, user]);

  const { data: servicesAsLeader } = useCollection<Service>(
    servicesAsLeaderQuery
  );
  const { data: servicesAsTeamMember } = useCollection<Service>(
    servicesAsTeamMemberQuery
  );

  const [upcomingServices, setUpcomingServices] = useState<Service[]>();

  useEffect(() => {
    if (servicesAsLeader === undefined || servicesAsTeamMember === undefined) {
      setUpcomingServices(undefined); // Still loading
      return;
    }
    const combined = new Map<string, Service>();
    [...(servicesAsLeader || []), ...(servicesAsTeamMember || [])].forEach(
      (service) => {
        combined.set(service.id, service);
      }
    );
    const sorted = Array.from(combined.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setUpcomingServices(sorted);
  }, [servicesAsLeader, servicesAsTeamMember]);

  const accountabilityGroupsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'peer_groups'),
            where('memberIds', 'array-contains', user.uid)
          )
        : null,
    [firestore, user]
  );
  const { data: accountabilityGroups } = useCollection<AccountabilityGroup>(
    accountabilityGroupsQuery
  );

  const currentAccountabilityGroup = accountabilityGroups?.[0];
  const groupLeaderRef = useMemoFirebase(
    () =>
      currentAccountabilityGroup
        ? doc(firestore, 'team_members', currentAccountabilityGroup.leaderId)
        : null,
    [firestore, currentAccountabilityGroup]
  );
  const { data: groupLeader } = useDoc<TeamMember>(groupLeaderRef);

  return (
    <div className='flex flex-col gap-8'>
      <div className='mb-2'>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
          {t('dashboard')}
        </h1>
        <p className='text-muted-foreground'>
          Welcome back, {teamMember?.name || user?.displayName || 'User'}!
          Here's your personalized dashboard.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Main Column */}
        <div className='lg:col-span-2 flex flex-col gap-6'>
          <div className='space-y-4'>
            <h2 className='text-xl md:text-2xl font-semibold flex items-center gap-2'>
              <Calendar className='h-6 w-6' />
              My Upcoming Services
            </h2>
            {upcomingServices === undefined ? (
              <div className='space-y-4'>
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className='flex flex-col md:flex-row'>
                    <div className='relative w-full h-40 md:w-48 md:h-auto flex-shrink-0 bg-muted animate-pulse'></div>
                    <div className='p-4 flex flex-col justify-between flex-grow space-y-2'>
                      <div className='h-5 bg-muted rounded w-3/4 animate-pulse'></div>
                      <div className='h-4 bg-muted rounded w-1/2 animate-pulse'></div>
                      <div className='h-4 bg-muted rounded w-1/3 animate-pulse'></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : upcomingServices.length > 0 ? (
              <div className='space-y-4'>
                {upcomingServices.map((service) => (
                  <Card
                    key={service.id}
                    className='overflow-hidden flex flex-col md:flex-row'
                  >
                    <div className='relative w-full h-40 md:w-48 md:h-auto flex-shrink-0'>
                      <Image
                        src={service.imageUrl}
                        alt={service.theme}
                        fill
                        className='object-cover'
                        data-ai-hint='worship service'
                      />
                    </div>
                    <div className='p-4 flex flex-col justify-between flex-grow'>
                      <div>
                        <h3 className='text-base md:text-lg font-bold truncate'>
                          {service.theme}
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          {new Date(
                            service.date instanceof Timestamp
                              ? service.date.toDate()
                              : (service.date as string)
                          ).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          Led by: {service.worshipLeaderName}
                        </p>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        className='mt-4 self-start'
                        asChild
                      >
                        <Link href={`/services/${service.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-muted/50'>
                <CalendarDays className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold'>No Upcoming Services</h3>
                <p className='text-sm text-muted-foreground'>
                  You are not scheduled for any upcoming services.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Side Column */}
        <div className='lg:col-span-1'>
          <Card className='sticky top-6'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-xl md:text-2xl'>
                <UserCheck className='h-5 w-5' />
                Your Focus
              </CardTitle>
              <CardDescription>
                Your skills and accountability group.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* My Skills Section */}
              <div>
                <div className='flex items-center gap-2 mb-4'>
                  <Target className='h-5 w-5 text-muted-foreground' />
                  <h4 className='font-semibold text-lg'>My Skills</h4>
                </div>
                <div className='space-y-4'>
                  {teamMember === undefined ? ( // Loading state
                    <div className='space-y-4'>
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className='space-y-2'>
                          <div className='h-4 bg-muted rounded w-3/4 animate-pulse'></div>
                          <div className='h-2 bg-muted rounded w-full animate-pulse'></div>
                        </div>
                      ))}
                    </div>
                  ) : teamMember && teamMember.skills?.length > 0 ? ( // Data loaded and has skills
                    teamMember.skills.map((skill) => (
                      <div key={skill.skill} className='space-y-1'>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm font-medium'>
                            {skill.skill}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {skill.progress}%
                          </span>
                        </div>
                        <Progress value={skill.progress} className='h-2' />
                      </div>
                    ))
                  ) : (
                    // No skills or data failed to load
                    <p className='text-sm text-muted-foreground italic'>
                      No skills are being tracked currently.
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Accountability Group Section */}
              <div>
                <div className='flex items-center gap-2 mb-4'>
                  <HeartHandshake className='h-5 w-5 text-muted-foreground' />
                  <h4 className='font-semibold text-lg'>
                    Accountability Group
                  </h4>
                </div>
                {currentAccountabilityGroup ? (
                  <div className='space-y-2'>
                    <p className='font-semibold'>
                      {currentAccountabilityGroup.name}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Led by:{' '}
                      {groupLeader?.name ||
                        currentAccountabilityGroup.leaderName ||
                        '...'}
                    </p>
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    You are not in any accountability group yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
