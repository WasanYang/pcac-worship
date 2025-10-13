
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
import { HeartHandshake, ListMusic, Users, CalendarDays, User, Target } from 'lucide-react';
import {
  recentSongs,
  upcomingServices as placeholderServices,
  teamMembers as placeholderTeamMembers,
  accountabilityGroups as placeholderAccountabilityGroups,
} from '@/lib/placeholder-data';
import { useI18n } from '@/providers/i18n-provider';
import { useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Service, TeamMember, AccountabilityGroup, Schedule } from '@/lib/placeholder-data';
import { Progress } from '@/components/ui/progress';


export default function Dashboard() {
  const { t } = useI18n();
  const { user } = useUser();
  const firestore = useFirestore();

  const teamMemberRef = useMemoFirebase(() => user ? doc(firestore, 'team_members', user.uid) : null, [firestore, user]);
  const { data: teamMember } = useDoc<TeamMember>(teamMemberRef);

  const schedulesQuery = useMemoFirebase(() => user ? query(collection(firestore, 'schedules'), where('teamMemberId', '==', user.uid)) : null, [firestore, user]);
  const { data: schedules } = useCollection<Schedule>(schedulesQuery);

  const serviceIds = useMemoFirebase(() => schedules?.map(s => s.serviceId) || [], [schedules]);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore || serviceIds.length === 0) return null;
    return query(collection(firestore, 'services'), where('id', 'in', serviceIds));
  }, [firestore, serviceIds]);
  const { data: userServices } = useCollection<Service>(servicesQuery);

  const accountabilityGroupsQuery = useMemoFirebase(() => user ? query(collection(firestore, 'peer_groups'), where('memberIds', 'array-contains', user.uid)) : null, [firestore, user]);
  const { data: accountabilityGroups } = useCollection<AccountabilityGroup>(accountabilityGroupsQuery);

  const upcomingServices = userServices
    ?.filter(service => {
        try {
            return Timestamp.fromDate(new Date(service.date)).toDate() > new Date();
        } catch (e) {
            return false;
        }
    })
    .slice(0, 3) || placeholderServices.slice(0,3);

  const currentAccountabilityGroup = accountabilityGroups?.[0];
  const groupLeaderRef = useMemoFirebase(() => currentAccountabilityGroup ? doc(firestore, 'team_members', currentAccountabilityGroup.leaderId) : null, [firestore, currentAccountabilityGroup]);
  const { data: groupLeader } = useDoc<TeamMember>(groupLeaderRef);


  return (
    <div className='flex flex-col gap-6'>
       <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('dashboard')}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {teamMember?.name || user?.displayName || 'User'}! Here's your personalized dashboard.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className='h-5 w-5' />
              My Upcoming Services
            </CardTitle>
            <CardDescription>{t('upcomingServicesDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-4 md:grid-cols-3'>
            {upcomingServices.map((service) => (
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
                    {new Date(service.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
             {upcomingServices.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center">No upcoming services scheduled.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeartHandshake className='h-5 w-5' />
                        My Accountability Group
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {currentAccountabilityGroup ? (
                         <div className="space-y-2">
                            <p className="font-semibold">{currentAccountabilityGroup.name}</p>
                            <p className="text-sm text-muted-foreground">Led by: {groupLeader?.name || '...'}</p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">You are not in any accountability group yet.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className='h-5 w-5' />
                        My Skills
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {teamMember?.skills?.length > 0 ? teamMember.skills.map(skill => (
                        <div key={skill.skill} className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{skill.skill}</span>
                                <span className="text-xs text-muted-foreground">{skill.progress}%</span>
                            </div>
                            <Progress value={skill.progress} className="h-2" />
                        </div>
                    )) : (
                         <p className="text-muted-foreground">No skills are being tracked currently.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
