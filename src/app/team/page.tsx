'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { TeamMember } from '@/lib/placeholder-data';
import { useI18n } from '@/providers/i18n-provider';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function TeamPage() {
  const { t } = useI18n();
  const firestore = useFirestore();
  const teamMembersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'team_members') : null),
    [firestore]
  );
  const { data: allUsers } = useCollection<TeamMember>(teamMembersQuery);

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {t('teamMembers')}
          </h1>
          <p className='text-muted-foreground'>{t('teamMembersDesc')}</p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4'>
        {allUsers?.map((member) => (
          <Link href={`/team/${member.id}`} key={member.id}>
            <Card  className='text-center h-full hover:bg-muted/50 transition-colors'>
              <CardHeader>
                <Avatar className='mx-auto h-20 w-20'>
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
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                 <div className='flex flex-wrap justify-center gap-1 mt-2'>
                    {(Array.isArray(member.role) ? member.role : [member.role]).map(
                        (role) => (
                          <Badge key={role} variant='secondary' className="text-xs">
                            {role}
                          </Badge>
                        )
                      )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
