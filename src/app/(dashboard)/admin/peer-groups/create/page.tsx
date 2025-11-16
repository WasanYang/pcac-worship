'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, updateDoc } from 'firebase/firestore';
import type { TeamMember } from '@/lib/placeholder-data';
import { useI18n } from '@/providers/i18n-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { MemberCombobox } from '@/components/member-combobox';
import { MultiMemberCombobox } from '@/components/multi-member-combobox';

export default function AdminNewPeerGroupPage() {
  const { t } = useI18n();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [groupName, setGroupName] = useState('');
  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: allMembers, isLoading: isLoadingMembers } =
    useCollection<TeamMember>(
      useMemoFirebase(
        () => (firestore ? collection(firestore, 'team_members') : null),
        [firestore]
      )
    );

  const availableForLeader = useMemo(() => {
    if (!allMembers) return [];
    return allMembers.filter((m) => !memberIds.includes(m.id));
  }, [allMembers, memberIds]);

  const availableForMembers = useMemo(() => {
    if (!allMembers) return [];
    return allMembers.filter((m) => m.id !== leaderId);
  }, [allMembers, leaderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !leaderId) {
      toast({
        variant: 'destructive',
        title: t('peer_groups.admin.create_error_title'),
        description: t('peer_groups.admin.create_error_desc'),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const peerGroupsCollection = collection(firestore, 'peer_groups');
      const newDocRef = await addDoc(peerGroupsCollection, {
        name: groupName,
        leaderId: leaderId,
        memberIds: memberIds,
      });
      // Set the document ID on the document itself
      await updateDoc(newDocRef, { id: newDocRef.id });

      toast({
        title: t('peer_groups.admin.create_success_title'),
        description: t('peer_groups.admin.create_success_desc', {
          name: groupName,
        }),
      });
      router.push('/admin/peer-groups');
    } catch (error) {
      console.error('Error creating peer group:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('peer_groups.admin.create_failed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='icon' className='h-7 w-7' asChild>
          <Link href='/admin/peer-groups'>
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>{t('back')}</span>
          </Link>
        </Button>
        <h1 className='flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0'>
          {t('peer_groups.admin.create_new_group')}
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('peer_groups.admin.group_details')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='group-name'>
              {t('peer_groups.admin.group_name')}
            </Label>
            <Input
              id='group-name'
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label>{t('leader')}</Label>
            <MemberCombobox
              members={availableForLeader}
              onSelectMember={setLeaderId}
              selectedMemberId={leaderId}
              triggerText={t('peer_groups.admin.select_leader')}
              isLoading={isLoadingMembers}
            />
          </div>
          <div className='space-y-2'>
            <Label>{t('peer_groups.detail.members')}</Label>
            <MultiMemberCombobox
              members={availableForMembers}
              selectedMemberIds={memberIds}
              onSelectedMemberIdsChange={setMemberIds}
              placeholder={t('peer_groups.admin.select_members')}
              isLoading={isLoadingMembers}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('createGroup')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
