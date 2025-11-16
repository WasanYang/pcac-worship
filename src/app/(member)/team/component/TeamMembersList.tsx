'use client';

import { Card, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { TeamMember } from '@/lib/placeholder-data';
import { useI18n } from '@/providers/i18n-provider';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const MAX_ROLES_TO_SHOW = 4;

export function TeamMembersList() {
  const firestore = useFirestore();
  const teamMembersQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'team_members'),
            where('status', '==', 'active')
          )
        : null,
    [firestore]
  );
  const { data: allUsers } = useCollection<TeamMember>(teamMembersQuery);

  const { t } = useI18n();

  return (
    <div className='grid grid-cols-1 gap-4'>
      {allUsers?.map((member) => {
        const roles = Array.isArray(member.role) ? member.role : [member.role];
        const displayedRoles = roles.slice(0, MAX_ROLES_TO_SHOW);
        const remainingRoles = roles.length - displayedRoles.length;

        return (
          <Link href={`/team/${member.id}`} key={member.id}>
            <Card className='p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 border-none rounded-3xl'>
              <Avatar className='h-14 w-14'>
                <AvatarImage
                  src={member.avatarUrl}
                  alt={member.name}
                  data-ai-hint='person portrait'
                />
                <AvatarFallback>
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className='flex-grow'>
                <CardTitle className='text-base md:text-lg'>
                  {member.name}
                </CardTitle>
                <div className='flex flex-wrap items-center gap-1 text-xs mt-1'>
                  {displayedRoles.map((role) => (
                    <Badge
                      key={role}
                      variant='secondary'
                      className='text-xs font-normal'
                    >
                      {role}
                    </Badge>
                  ))}
                  {remainingRoles > 0 && (
                    <Badge variant='outline' className='text-xs font-normal'>
                      {t('team.list.more_roles', { count: remainingRoles })}
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronRight className='h-5 w-5 text-muted-foreground' />
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
