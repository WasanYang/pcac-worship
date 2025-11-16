'use client';

import { Card, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { PeerGroup } from '@/lib/placeholder-data';
import { useI18n } from '@/providers/i18n-provider';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Users } from 'lucide-react';

export function PeerGroupsList() {
  const { t } = useI18n();
  const firestore = useFirestore();
  const peerGroupsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'peer_groups') : null),
    [firestore]
  );
  const { data: peerGroups } = useCollection<PeerGroup>(peerGroupsQuery);

  return (
    <div className='grid grid-cols-1 gap-4'>
      {peerGroups?.map((group) => (
        <Link href={`/team/peer-group/${group.id}`} key={group.id}>
          <Card className='p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 border-none rounded-3xl'>
            <Avatar className='h-14 w-14'>
              <AvatarFallback>
                <Users className='h-6 w-6' />
              </AvatarFallback>
            </Avatar>
            <div className='flex-grow'>
              <CardTitle className='text-base md:text-lg'>
                {group.name}
              </CardTitle>
              <div className='flex items-center gap-1 text-xs text-muted-foreground mt-1'>
                {(group.memberIds?.length || 0) + (group.leaderId ? 1 : 0)}{' '}
                {t('members')}
              </div>
            </div>
            <ChevronRight className='h-5 w-5 text-muted-foreground' />
          </Card>
        </Link>
      ))}
    </div>
  );
}
