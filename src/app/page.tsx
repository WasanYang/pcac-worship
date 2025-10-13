
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
import { HeartHandshake, ListMusic, Users, CalendarDays, User, Target, Calendar, UserCheck } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';


export default function Dashboard() {
  const { t } = useI18n();
  const { user } = useUser();
  const firestore = useFirestore();

  const teamMemberRef = useMemoFirebase(() => user ? doc(firestore, 'team_members', user.uid) : null, [firestore, user]);
  const { data: teamMember } = useDoc<TeamMember>(teamMemberRef);

  const schedulesQuery = useMemoFirebase(() => user ? query(collection(firestore, 'schedules'), where('teamMemberId', '==', user.uid)) : null, [firestore, user]);
  const { data: schedules } = useCollection<Schedule>(schedulesQuery);

  const serviceIds = schedules?.map(s => s.serviceId) || [];

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore || serviceIds.length === 0) return null;
    // Firestore 'in' queries are limited to 30 items.
    // If you expect more, you'll need to handle batching.
    return query(collection(firestore, 'services'), where('id', 'in', serviceIds.slice(0, 30)));
  }, [firestore, serviceIds]);
  const { data: userServices } = useCollection<Service>(servicesQuery);

  const accountabilityGroupsQuery = useMemoFirebase(() => user ? query(collection(firestore, 'peer_groups'), where('memberIds', 'array-contains', user.uid)) : null, [firestore, user]);
  const { data: accountabilityGroups } = useCollection<AccountabilityGroup>(accountabilityGroupsQuery);

  const upcomingServices = userServices
    ?.filter(service => {
        try {
            // Handle both string dates and Firestore Timestamps
            const serviceDate = service.date instanceof Timestamp ? service.date.toDate() : new Date(service.date);
            return serviceDate > new Date();
        } catch (e) {
            return false;
        }
    })
    .sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5) || [];


  const currentAccountabilityGroup = accountabilityGroups?.[0];
  const groupLeaderRef = useMemoFirebase(() => currentAccountabilityGroup ? doc(firestore, 'team_members', currentAccountabilityGroup.leaderId) : null, [firestore, currentAccountabilityGroup]);
  const { data: groupLeader } = useDoc<TeamMember>(groupLeaderRef);


  return (
    <div className='flex flex-col gap-8'>
       <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('dashboard')}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {teamMember?.name || user?.displayName || 'User'}! Here's your personalized dashboard.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        
        {/* Main Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Calendar className="h-6 w-6"/>
                    My Upcoming Services
                </h2>
                {upcomingServices.length > 0 ? (
                    <div className="space-y-4">
                    {upcomingServices.map((service) => (
                    <Card key={service.id} className="overflow-hidden flex flex-col md:flex-row">
                        <div className="relative w-full h-40 md:w-48 md:h-auto flex-shrink-0">
                            <Image
                                src={service.imageUrl}
                                alt={service.theme}
                                fill
                                className='object-cover'
                                data-ai-hint='worship service'
                            />
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-grow">
                            <div>
                                <h3 className='text-lg font-bold truncate'>{service.theme}</h3>
                                <p className='text-sm text-muted-foreground'>
                                    {new Date(service.date instanceof Timestamp ? service.date.toDate() : service.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <p className='text-sm text-muted-foreground'>Led by: {service.worshipLeader}</p>
                            </div>
                             <Button variant="outline" size="sm" className="mt-4 self-start">View Details</Button>
                        </div>
                    </Card>
                    ))}
                    </div>
                ) : (
                     <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-muted/50">
                        <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No Upcoming Services</h3>
                        <p className="text-sm text-muted-foreground">You are not scheduled for any upcoming services.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Side Column */}
        <div className="lg:col-span-1">
             <Card className="sticky top-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className='h-5 w-5' />
                        Your Focus
                    </CardTitle>
                    <CardDescription>Your skills and accountability group.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* My Skills Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="h-5 w-5 text-muted-foreground" />
                            <h4 className="font-semibold text-lg">My Skills</h4>
                        </div>
                        <div className="space-y-4">
                            {teamMember?.skills?.length > 0 ? teamMember.skills.map(skill => (
                                <div key={skill.skill} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">{skill.skill}</span>
                                        <span className="text-xs text-muted-foreground">{skill.progress}%</span>
                                    </div>
                                    <Progress value={skill.progress} className="h-2" />
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground">No skills are being tracked currently.</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Accountability Group Section */}
                    <div>
                         <div className="flex items-center gap-2 mb-4">
                            <HeartHandshake className="h-5 w-5 text-muted-foreground" />
                            <h4 className="font-semibold text-lg">Accountability Group</h4>
                        </div>
                        {currentAccountabilityGroup ? (
                            <div className="space-y-2">
                                <p className="font-semibold">{currentAccountabilityGroup.name}</p>
                                <p className="text-sm text-muted-foreground">Led by: {groupLeader?.name || '...'}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">You are not in any accountability group yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
