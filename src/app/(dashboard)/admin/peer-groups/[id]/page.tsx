'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useFirestore,
  useDoc,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  doc,
  collection,
  query,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
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
import {
  ArrowLeft,
  Crown,
  Users,
  Trash2,
  Loader2,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { MemberCombobox } from '@/components/member-combobox';
import { MultiMemberCombobox } from '@/components/multi-member-combobox';

export default function AdminPeerGroupDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const groupId = params.id as string;

  const firestore = useFirestore();

  const groupRef = useMemoFirebase(
    () =>
      firestore && groupId ? doc(firestore, 'peer_groups', groupId) : null,
    [firestore, groupId]
  );
  const { data: group, isLoading: isLoadingGroup } =
    useDoc<PeerGroup>(groupRef);

  const { data: allMembers, isLoading: isLoadingMembers } =
    useCollection<TeamMember>(
      useMemoFirebase(
        () => (firestore ? collection(firestore, 'team_members') : null),
        [firestore]
      )
    );

  const currentMemberIds = useMemo(() => {
    if (!group) return new Set<string>();
    const ids = new Set(group.memberIds || []);
    if (group.leaderId) ids.add(group.leaderId);
    return ids;
  }, [group]);

  const groupMembers = useMemo(() => {
    return allMembers?.filter((m) => currentMemberIds.has(m.id)) || [];
  }, [allMembers, currentMemberIds]);

  const availableMembers = useMemo(() => {
    return allMembers?.filter((m) => !currentMemberIds.has(m.id)) || [];
  }, [allMembers, currentMemberIds]);

  const leader = useMemo(
    () => allMembers?.find((m) => m.id === group?.leaderId),
    [allMembers, group]
  );

  const handleRemoveMember = async (memberId: string) => {
    if (!groupRef) return;
    try {
      await updateDoc(groupRef, {
        memberIds: arrayRemove(memberId),
      });
      toast({
        title: t('success'),
        description: t('peer_groups.admin.member_removed'),
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('peer_groups.admin.remove_failed'),
      });
    }
  };

  const handleAddMember = async (memberId: string) => {
    if (!groupRef || !memberId) return;
    try {
      await updateDoc(groupRef, {
        memberIds: arrayUnion(memberId),
      });
      toast({
        title: t('success'),
        description: t('peer_groups.admin.member_added'),
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('peer_groups.admin.add_failed'),
      });
    }
  };

  const handleChangeLeader = async (leaderId: string) => {
    if (!groupRef || !leaderId) return;
    try {
      await updateDoc(groupRef, {
        leaderId: leaderId,
      });
      toast({
        title: t('success'),
        description: t('peer_groups.admin.leader_changed'),
      });
    } catch (error) {
      console.error('Error changing leader:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('peer_groups.admin.change_leader_failed'),
      });
    }
  };

  const isLoading = isLoadingGroup || isLoadingMembers;

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader2 className='h-16 w-16 animate-spin' />
      </div>
    );
  }

  if (!group) {
    return <div>{t('peer_groups.detail.notFound')}</div>;
  }

  return (
    <div className='flex flex-col gap-8'>
      <Button variant='outline' size='sm' className='self-start' asChild>
        <Link href='/admin/peer-groups'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          {t('peer_groups.admin.back_to_list')}
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>
            {t('peer_groups.admin.manage_leader')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MemberCombobox
            members={groupMembers}
            selectedMemberId={group.leaderId}
            onSelectMember={handleChangeLeader}
            triggerText={t('peer_groups.admin.change_leader')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            <CardTitle className='text-lg'>
              {t('peer_groups.detail.members')} ({groupMembers.length})
            </CardTitle>
          </div>
          <MultiMemberCombobox
            members={availableMembers}
            selectedMemberIds={[]} // Pass empty array as we only add one by one
            onSelectedMemberIdsChange={(ids) => handleAddMember(ids[0])} // It will only ever have one id
            placeholder={t('peer_groups.admin.add_member')}
          />
        </CardHeader>
        <CardContent>
          <ul className='space-y-4'>
            {groupMembers.map((member) => (
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
                {member.id !== group.leaderId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('peer_groups.admin.confirm_remove_title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('peer_groups.admin.confirm_remove_desc', {
                            name: member.name,
                          })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          {t('peer_groups.admin.remove')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
