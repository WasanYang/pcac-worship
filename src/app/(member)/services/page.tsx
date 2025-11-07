'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/providers/i18n-provider';
import Link from 'next/link';
import {
  useAuth,
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import type { Service, TeamMember } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ServiceCard } from '@/components/service-card';

export default function ServicesPage() {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const firestore = useFirestore();
  const servicesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'services') : null),
    [firestore]
  );
  const { data: services, isLoading } = useCollection<Service>(servicesQuery);

  const uniqueTeamMemberIds = useMemo(() => {
    if (!services) return [];
    const allIds = services.flatMap(
      (service) => service.team?.map((member) => member.memberId) || []
    );
    return [...new Set(allIds)];
  }, [services]);

  const teamMembersQuery = useMemoFirebase(
    () =>
      firestore && uniqueTeamMemberIds.length > 0
        ? query(
            collection(firestore, 'team_members'),
            where(documentId(), 'in', uniqueTeamMemberIds)
          )
        : null,
    [firestore, uniqueTeamMemberIds]
  );
  const { data: allUsers, isLoading: isLoadingTeam } =
    useCollection<TeamMember>(teamMembersQuery);

  return (
    <div className='flex flex-col gap-8'>
      {isLoading && (
        <div className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className='flex flex-col gap-2'>
              <div className='aspect-square w-full rounded-md bg-muted animate-pulse' />
              <div className='h-4 w-3/4 rounded-md bg-muted animate-pulse' />
              <div className='h-3 w-1/2 rounded-md bg-muted animate-pulse' />
            </div>
          ))}
        </div>
      )}

      {!isLoading && services && services.length === 0 && (
        <div className='flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-muted/50'>
          <h3 className='text-lg font-semibold'>No Services Found</h3>
          <p className='text-sm text-muted-foreground'>
            Create a new service to get started.
          </p>
        </div>
      )}

      <div className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4'>
        {services?.map((service) => {
          const isLeader = service.worshipLeaderId === currentUser?.uid;
          const isInTeam =
            service.team?.some(
              (member) => member.memberId === currentUser?.uid
            ) || false;
          const isOver = service.date.toDate() < new Date();

          const isUserInvolved = (isLeader || isInTeam) && !isOver;

          return (
            <Link href={`/services/${service.id}`} key={service.id}>
              <ServiceCard
                service={service}
                teamsMembers={allUsers || []}
                isUserInvolved={isUserInvolved}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
