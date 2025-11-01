'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useI18n } from '@/providers/i18n-provider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// prettier-ignore
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string | string[];
  skills?: { skill: string; progress: number }[];
}

const AVAILABLE_ROLES = [
  'Admin',
  'Worship Leader',
  'Musician',
  'Vocalist',
  'Media',
  'Sound',
];

export default function AdminTeamsPage() {
  const { t } = useI18n();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const {
    data: allTeamMembers,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useCollection<TeamMember>(
    useMemoFirebase(
      () => (firestore ? collection(firestore, 'team_members') : null),
      [firestore]
    )
  );

  const sortedMembers = useMemo(() => {
    if (!allTeamMembers) return [];
    return [...allTeamMembers].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
  }, [allTeamMembers]);

  const getRoles = (member: TeamMember) => {
    if (!member.role) return [];
    return Array.isArray(member.role) ? member.role : [member.role];
  };

  const handleRoleChange = async (
    memberId: string,
    role: string,
    isChecked: boolean
  ) => {
    const member = allTeamMembers?.find((m) => m.id === memberId);
    if (!member || !firestore) return;

    setUpdatingMemberId(memberId);
    const currentRoles = getRoles(member);
    const newRoles = isChecked
      ? [...currentRoles, role]
      : currentRoles.filter((r) => r !== role);

    const memberRef = doc(firestore, 'team_members', memberId);
    try {
      await updateDoc(memberRef, { role: newRoles });
      toast({
        title: 'Success',
        description: `Roles for ${member.name} updated.`,
      });
    } catch (error) {
      console.error('Error updating roles:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update roles.',
      });
    } finally {
      setUpdatingMemberId(null);
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
            {t('teamMembers')}
          </h1>
          <p className='text-muted-foreground'>{t('teamMembersDesc')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Team Members</CardTitle>
          <CardDescription>
            List of all members in the worship team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingMembers ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center'>
                    <Loader2 className='mx-auto h-6 w-6 animate-spin text-muted-foreground' />
                  </TableCell>
                </TableRow>
              ) : membersError ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className='text-center text-destructive'
                  >
                    Error loading team members.
                  </TableCell>
                </TableRow>
              ) : (
                sortedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9'>
                          <AvatarImage
                            src={member.avatarUrl}
                            alt={member.name}
                          />
                          <AvatarFallback>
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium'>{member.name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {getRoles(member).map((role) => (
                          <Badge key={role} variant='secondary'>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      {updatingMemberId === member.id ? (
                        <Loader2 className='h-4 w-4 animate-spin ml-auto' />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <span className='sr-only'>Open menu</span>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Manage Roles</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {AVAILABLE_ROLES.map((role) => (
                              <DropdownMenuCheckboxItem
                                key={role}
                                checked={getRoles(member).includes(role)}
                                onCheckedChange={(checked) =>
                                  handleRoleChange(member.id, role, checked)
                                }
                                onSelect={(e) => e.preventDefault()} // Prevent menu from closing on item click
                              >
                                {role}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
