'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/providers/i18n-provider';
import { useToast } from '@/hooks/use-toast';
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
import { CheckCircle, Loader2 } from 'lucide-react';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  User,
} from '@/lib/features/user/user-api';

export default function AdminPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);

  const {
    data: allUsers,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();

  const sortedUsers = useMemo(() => {
    if (!allUsers) return [];
    return [...allUsers].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return (a.displayName || '').localeCompare(b.displayName || '');
    });
  }, [allUsers]);

  const handleApproveUser = async (user: User) => {
    setApprovingUserId(user.uid);
    setIsLoading(true); // This state is now used for both approve and revoke

    try {
      await updateUser({ uid: user.uid, payload: { status: 'approved' } });
      toast({
        title: 'User Approved',
        description: `${user.displayName || user.email} is now a team member.`,
      });
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        variant: 'destructive',
        title: 'Approval Failed',
        description: 'Could not approve the user. Please try again.',
      });
    } finally {
      setApprovingUserId(null);
      setIsLoading(false);
    }
  };

  const handleRevokeUser = async (user: User) => {
    setApprovingUserId(user.uid);
    setIsLoading(true);

    try {
      await updateUser({ uid: user.uid, payload: { status: 'pending' } });
      toast({
        title: 'User Access Revoked',
        description: `${
          user.displayName || user.email
        } access has been revoked.`,
      });
    } catch (error) {
      console.error('Error revoking user:', error);
      toast({
        variant: 'destructive',
        title: 'Revoke Failed',
        description: 'Could not revoke user access. Please try again.',
      });
    } finally {
      setApprovingUserId(null);
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
            {t('admin')}
          </h1>
          <p className='text-muted-foreground'>
            Approve new users to grant them access to the dashboard.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All System Users</CardTitle>
          <CardDescription>
            List of all users in the system. You can edit their roles here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUsers ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center'>
                    <Loader2 className='mx-auto h-6 w-6 animate-spin text-muted-foreground' />
                  </TableCell>
                </TableRow>
              ) : usersError ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className='text-center text-destructive'
                  >
                    Error loading users.
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9'>
                          <AvatarImage
                            src={user.photoURL || undefined}
                            alt={user.displayName || 'User'}
                          />
                          <AvatarFallback>
                            {user.displayName
                              ? user.displayName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                              : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium'>{user.displayName}</p>
                          <p className='text-sm text-muted-foreground'>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === 'approved' ? 'default' : 'secondary'
                        }
                        className={
                          user.status === 'approved' ? 'bg-green-600' : ''
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      {user.status !== 'approved' ? (
                        <Button
                          size='sm'
                          onClick={() => handleApproveUser(user)}
                          disabled={isLoading && approvingUserId === user.uid}
                        >
                          {isLoading && approvingUserId === user.uid ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          ) : null}
                          Approve
                        </Button>
                      ) : (
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => handleRevokeUser(user)}
                          disabled={isLoading && approvingUserId === user.uid}
                        >
                          {isLoading && approvingUserId === user.uid ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          ) : (
                            <CheckCircle className='mr-2 h-4 w-4' />
                          )}
                          Revoke
                        </Button>
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
