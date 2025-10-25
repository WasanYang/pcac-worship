'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamMember, teamMembers } from '@/lib/placeholder-data';
import { useI18n } from '@/providers/i18n-provider';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

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

      <div className='grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4'>
        {allUsers?.map((member) => (
          <Card key={member.id} className='text-center'>
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
              <CardTitle>{member.name}</CardTitle>
              <CardDescription>{(Array.isArray(member.role) ? member.role.join(', ') : member.role)}</CardDescription>
            </CardContent>
            <CardFooter className='flex justify-center gap-2'>
              <Button variant='outline' size='sm'>
                {t('profile')}
              </Button>
              <Button variant='secondary' size='sm'>
                {t('skills')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
