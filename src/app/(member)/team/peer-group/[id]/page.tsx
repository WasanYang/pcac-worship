'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  useFirestore,
  useDoc,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { PeerGroup, TeamMember } from '@/lib/placeholder-data';
import { useI18n } from '@/providers/i18n-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function PeerGroupDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const groupId = params.id as string;

  const firestore = useFirestore();

  // Fetch the peer group document
  const groupRef = useMemoFirebase(
    () =>
      firestore && groupId ? doc(firestore, 'peer_groups', groupId) : null,
    [firestore, groupId]
  );
  const { data: group, isLoading: isLoadingGroup } =
    useDoc<PeerGroup>(groupRef);

  // Get all member IDs from the group
  const memberIds = useMemo(() => {
    if (!group) return [];
    const ids = new Set(group.memberIds || []);
    if (group.leaderId) {
      ids.add(group.leaderId);
    }
    return Array.from(ids);
  }, [group]);

  // Fetch all team member documents for the members in this group
  const { data: members, isLoading: isLoadingMembers } =
    useCollection<TeamMember>(
      useMemoFirebase(
        () =>
          firestore && memberIds.length > 0
            ? query(
                collection(firestore, 'team_members'),
                where('id', 'in', memberIds)
              )
            : null,
        [firestore, memberIds]
      )
    );

  const isLoading = isLoadingGroup || isLoadingMembers;

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent'></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className='flex flex-col items-center justify-center text-center gap-4'>
        <h2 className='text-2xl font-semibold'>
          {t('peer_groups.detail.notFound')}
        </h2>
        <p>{t('peer_groups.detail.notFoundDesc')}</p>
        <Button asChild>
          <Link href='/team'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('backToTeam')}
          </Link>
        </Button>
      </div>
    );
  }

  const leader = members?.find((m) => m.id === group.leaderId);

  return (
    <div className='flex flex-col gap-8'>
      <Button variant='outline' size='sm' className='self-start' asChild>
        <Link href='/team'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          {t('backToTeam')}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className='text-xl md:text-2xl'>{group.name}</CardTitle>
          {leader && (
            <CardDescription className='flex items-center gap-2 pt-1'>
              <Crown className='h-4 w-4 text-amber-500' />
              <span>
                {t('ledBy')} {leader.name}
              </span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <h3 className='mb-4 text-lg font-semibold flex items-center gap-2'>
            <Users className='h-5 w-5' />
            {t('peer_groups.detail.members')}
          </h3>
          <ul className='space-y-4'>
            {members?.map((member) => (
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
                </div>
                {member.id === group.leaderId && (
                  <Badge variant='outline'>{t('leader')}</Badge>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
