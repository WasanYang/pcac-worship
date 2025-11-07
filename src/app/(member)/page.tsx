'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartHandshake, CalendarDays, Target, Calendar } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type {
  Service,
  TeamMember,
  AccountabilityGroup,
} from '@/lib/placeholder-data';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ServiceCard } from '@/components/service-card';

export default function Dashboard() {
  const { t } = useI18n();
  const { user } = useUser();
  const firestore = useFirestore();

  const teamMemberRef = useMemoFirebase(
    () => (user ? doc(firestore, 'team_members', user.uid) : null),
    [firestore, user]
  );
  const { data: teamMember, isLoading: isLoadingData } =
    useDoc<TeamMember>(teamMemberRef);

  const servicesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'services'),
            where('date', '>=', new Date()),
            orderBy('date', 'desc')
          )
        : null,
    [firestore]
  );

  const { data: servicesFromSchedules, isLoading } =
    useCollection<Service>(servicesQuery);

  const teamMemberIds = useMemo(() => {
    if (!servicesFromSchedules) return [];
    return [
      ...new Set(
        servicesFromSchedules.flatMap((s) => [
          s.worshipLeaderId,
          ...(s.team?.map((tm) => tm.memberId) || []),
        ])
      ),
    ];
  }, [servicesFromSchedules]);

  const teamMembersQuery = useMemoFirebase(
    () =>
      firestore && teamMemberIds.length > 0
        ? query(
            collection(firestore, 'team_members'),
            where('id', 'in', teamMemberIds)
          )
        : null,
    [firestore, teamMemberIds]
  );
  useEffect(() => {
    console.log(teamMemberIds);
  }, [teamMemberIds]);
  const { data: teamMembers } = useCollection<TeamMember>(teamMembersQuery);
  const [upcomingServices, setUpcomingServices] = useState<Service[]>();

  useEffect(() => {
    if (!servicesFromSchedules) {
      setUpcomingServices(undefined);
      return;
    }
    setUpcomingServices(servicesFromSchedules); // Data is now pre-sorted by Firestore
  }, [servicesFromSchedules]);

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
  const {
    data: accountabilityGroups,
    isLoading: isLoadingAccountabilityGroups,
  } = useCollection<AccountabilityGroup>(accountabilityGroupsQuery);

  const currentAccountabilityGroup = accountabilityGroups?.[0];
  const groupLeaderRef = useMemoFirebase(
    () =>
      // Only fetch group leader if accountability group is loaded and available
      !isLoadingAccountabilityGroups && currentAccountabilityGroup
        ? doc(firestore, 'team_members', currentAccountabilityGroup.leaderId)
        : null,
    [firestore, currentAccountabilityGroup]
  );
  const { data: groupLeader, isLoading: isLoadingGroupLeader } =
    useDoc<TeamMember>(groupLeaderRef);

  return (
    <div className='flex flex-col gap-8'>
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Main Column */}
        <div className='lg:col-span-2 flex flex-col gap-6'>
          <div className='space-y-4'>
            <h2 className='text-xl md:text-2xl font-semibold flex items-center gap-2'>
              <Calendar className='h-6 w-6' />
              My Upcoming Services
            </h2>
            {isLoading ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className='flex flex-col'>
                      <div className='relative w-full h-24 md:h-40 bg-muted animate-pulse'></div>
                      <div className='p-3 md:p-4 flex flex-col justify-between flex-grow space-y-2'>
                        <div className='h-4 md:h-5 bg-muted rounded w-3/4 animate-pulse'></div>
                        <div className='h-3 md:h-4 bg-muted rounded w-1/2 animate-pulse'></div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : upcomingServices && upcomingServices.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {upcomingServices.map((service) => {
                  const isLeader = service.worshipLeaderId === user?.uid;
                  const isTeamMember =
                    service.team?.some((tm) => tm.memberId === user?.uid) ||
                    false;
                  const serviceTeamMembers = teamMembers?.filter(
                    (member) =>
                      service.team?.some((tm) => tm.memberId === member.id) ||
                      service.worshipLeaderId === member.id
                  );
                  const isOver = service.date.toDate() < new Date();

                  const isUserInvolved = (isLeader || isTeamMember) && !isOver;
                  return (
                    <Link href={`/services/${service.id}`} key={service.id}>
                      <ServiceCard
                        service={service}
                        isUserInvolved={isUserInvolved}
                        teamsMembers={serviceTeamMembers}
                      />
                    </Link>
                  );
                })}
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
          <Card className='sticky top-6 border-none shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Target className='h-5 w-5' />
                My Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? ( // Loading state
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
                      <span className='text-sm font-medium'>{skill.skill}</span>
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
            </CardContent>

            <Separator className='my-4' />

            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <HeartHandshake className='h-5 w-5' />
                Accountability Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAccountabilityGroups || isLoadingGroupLeader ? (
                <div className='space-y-2'>
                  <div className='h-4 bg-muted rounded w-3/4 animate-pulse'></div>
                  <div className='h-3 bg-muted rounded w-1/2 animate-pulse'></div>
                </div>
              ) : currentAccountabilityGroup ? (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
