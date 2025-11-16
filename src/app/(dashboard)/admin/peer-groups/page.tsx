'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { PeerGroup, TeamMember } from '@/lib/placeholder-data';
import { useI18n } from '@/providers/i18n-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function AdminPeerGroupsPage() {
  const { t } = useI18n();
  const firestore = useFirestore();

  const { data: peerGroups, isLoading: isLoadingGroups } =
    useCollection<PeerGroup>(
      useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'peer_groups')) : null),
        [firestore]
      )
    );

  const { data: teamMembers, isLoading: isLoadingMembers } =
    useCollection<TeamMember>(
      useMemoFirebase(
        () => (firestore ? collection(firestore, 'team_members') : null),
        [firestore]
      )
    );

  const membersMap = useMemo(() => {
    if (!teamMembers) return new Map();
    return new Map(teamMembers.map((member) => [member.id, member]));
  }, [teamMembers]);

  const isLoading = isLoadingGroups || isLoadingMembers;

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-start'>
          <div>
            <CardTitle>{t('peer_groups.admin.title')}</CardTitle>
            <CardDescription>
              {t('peer_groups.admin.description')}
            </CardDescription>
          </div>
          <Button asChild>
            <Link href='/admin/peer-groups/create'>
              <PlusCircle className='mr-2 h-4 w-4' />
              {t('createGroup')}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex justify-center items-center h-40'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('leader')}</TableHead>
                <TableHead className='text-center'>
                  {t('peer_groups.detail.members')}
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {peerGroups?.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className='font-medium'>{group.name}</TableCell>
                  <TableCell>
                    {membersMap.get(group.leaderId)?.name || 'N/A'}
                  </TableCell>
                  <TableCell className='text-center'>
                    {(group.memberIds?.length || 0) + (group.leaderId ? 1 : 0)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button variant='outline' size='sm' asChild>
                      <Link href={`/admin/peer-groups/${group.id}`}>
                        {t('peer_groups.admin.manage')}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
