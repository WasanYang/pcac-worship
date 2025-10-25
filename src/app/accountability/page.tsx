
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Loader2, Trash2, Pencil, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/providers/i18n-provider";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import type { TeamMember, AccountabilityGroup } from "@/lib/placeholder-data";
import { useToast } from "@/hooks/use-toast";
import { AccountabilityGroupDialog } from "./_components/AccountabilityGroupDialog";
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


export default function AccountabilityPage() {
  const { t } = useI18n();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AccountabilityGroup | null>(null);

  const peerGroupsQuery = useMemoFirebase(
    () => firestore ? collection(firestore, "peer_groups") : null,
    [firestore]
  );
  const { data: accountabilityGroups, isLoading: isLoadingGroups } = useCollection<AccountabilityGroup>(peerGroupsQuery);

  const teamMembersQuery = useMemoFirebase(
    () => firestore ? collection(firestore, "team_members") : null,
    [firestore]
  );
  const { data: teamMembers } = useCollection<TeamMember>(teamMembersQuery);

  const handleOpenDialog = (group: AccountabilityGroup | null = null) => {
    setEditingGroup(group);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingGroup(null);
    setIsDialogOpen(false);
  };

  const handleSaveGroup = async (values: { name: string; leaderId: string; memberIds: string[] }) => {
    if (!firestore) return;

    try {
      if (editingGroup) {
        // Update existing group
        const groupDocRef = doc(firestore, 'peer_groups', editingGroup.id);
        const leader = teamMembers?.find(m => m.id === values.leaderId);
        const membersData = values.memberIds.map(id => {
            const existingMember = editingGroup.members.find(m => m.id === id);
            return {
                id,
                contactStatus: existingMember?.contactStatus || 'Pending'
            }
        });
        
        await updateDoc(groupDocRef, {
            name: values.name,
            leaderId: values.leaderId,
            leaderName: leader?.name || 'Unknown',
            memberIds: values.memberIds,
            members: membersData
        });

        toast({ title: "Group Updated", description: `The group "${values.name}" has been updated.` });
      } else {
        // Create new group
        const leader = teamMembers?.find(m => m.id === values.leaderId);
        const newGroupData = {
          name: values.name,
          leaderId: values.leaderId,
          leaderName: leader?.name || 'Unknown',
          memberIds: values.memberIds,
          members: values.memberIds.map(id => ({ id, contactStatus: 'Pending' })),
        };
        const docRef = await addDoc(collection(firestore, 'peer_groups'), newGroupData);
        await updateDoc(docRef, { id: docRef.id });

        toast({ title: "Group Created", description: `The group "${values.name}" has been created.` });
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving group:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not save the group." });
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'peer_groups', groupId));
      toast({ title: "Group Deleted", description: `The group "${groupName}" has been deleted.` });
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete the group." });
    }
  };
  
  const handleStatusChange = async (groupId: string, memberId: string, newStatus: "Contacted" | "Pending" | "Missed") => {
    if (!firestore || !accountabilityGroups) return;
    const group = accountabilityGroups.find(g => g.id === groupId);
    if (!group) return;

    const updatedMembers = group.members.map(member => 
        member.id === memberId ? { ...member, contactStatus: newStatus } : member
    );

    try {
        const groupDocRef = doc(firestore, 'peer_groups', groupId);
        await updateDoc(groupDocRef, { members: updatedMembers });
         toast({
            title: "Status Updated",
            description: `Status for a member in "${group.name}" has been updated.`,
        });
    } catch (error) {
        console.error("Error updating status:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update the status." });
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('accountabilityGroups')}</h1>
          <p className="text-muted-foreground">{t('accountabilityGroupsDesc')}</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> {t('createGroup')}
        </Button>
      </div>

      {isLoadingGroups && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoadingGroups && accountabilityGroups?.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-muted/50">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Accountability Groups Found</h3>
                <p className="text-sm text-muted-foreground">Create a group to get started.</p>
            </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {accountabilityGroups?.map((group) => {
          const leader = teamMembers?.find(m => m.id === group.leaderId);
          return (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{group.name}</CardTitle>
                        <CardDescription>
                          {t('ledBy')}{' '}
                          <span className="font-semibold text-foreground">{leader?.name || group.leaderName || '...'}</span>
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(group)}>
                            <Pencil className="h-4 w-4"/>
                            <span className="sr-only">Edit Group</span>
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the group &quot;{group.name}&quot;.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteGroup(group.id, group.name)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {group.members.map((member) => {
                    const memberInfo = teamMembers?.find(m => m.id === member.id);
                    if (!memberInfo) return null;
                    
                    const roles = Array.isArray(memberInfo.role) ? memberInfo.role : [memberInfo.role];
                    
                    return (
                      <li key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={memberInfo?.avatarUrl} alt={memberInfo.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{memberInfo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{memberInfo.name}</p>
                            <p className="text-sm text-muted-foreground">{roles.join(', ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{t('status')}:</span>
                          <Select defaultValue={member.contactStatus} onValueChange={(value) => handleStatusChange(group.id, member.id, value as any)}>
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                              <SelectValue placeholder={t('status')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Contacted">{t('contacted')}</SelectItem>
                              <SelectItem value="Pending">{t('pending')}</SelectItem>
                              <SelectItem value="Missed">{t('missed')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {teamMembers && (
        <AccountabilityGroupDialog
            isOpen={isDialogOpen}
            onClose={handleCloseDialog}
            onSave={handleSaveGroup}
            group={editingGroup}
            teamMembers={teamMembers}
        />
      )}

    </div>
  );
}

