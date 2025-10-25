'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { TeamMember } from '@/lib/placeholder-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar as CalendarIcon, Target, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/providers/i18n-provider';
import { Separator } from '@/components/ui/separator';

export default function TeamMemberDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const memberId = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();

  const teamMemberRef = useMemoFirebase(
    () => (firestore && memberId ? doc(firestore, 'team_members', memberId) : null),
    [firestore, memberId]
  );
  const { data: teamMember, isLoading } = useDoc<TeamMember>(teamMemberRef);

  if (isLoading) {
    return (
        <div className='flex h-screen items-center justify-center'>
            <div className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent'></div>
        </div>
    );
  }

  if (!teamMember) {
    return (
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-semibold">Team Member Not Found</h2>
        <p>The user you are looking for does not exist.</p>
        <Button onClick={() => window.history.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }
  
  const userRoles = Array.isArray(teamMember?.role) ? teamMember.role : (teamMember?.role ? [teamMember.role] : []);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader className="items-center text-center">
                    <Avatar className="w-24 h-24 mb-4">
                        <AvatarImage src={teamMember.avatarUrl} alt={teamMember.name} />
                        <AvatarFallback>{teamMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl md:text-2xl">{teamMember.name}</CardTitle>
                    <div className='flex flex-wrap justify-center gap-1 pt-2'>
                        {userRoles.map(role => <Badge key={role} variant="secondary">{role}</Badge>)}
                    </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                   <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4" />
                        <span>{teamMember.email}</span>
                   </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">Details</CardTitle>
                    <CardDescription>Member information and activity.</CardDescription>
                </CardHeader>
                <CardContent>
                   <p>Further details about the team member will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
