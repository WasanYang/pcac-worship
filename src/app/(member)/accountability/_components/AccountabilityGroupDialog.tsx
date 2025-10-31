
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { TeamMember, AccountabilityGroup } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';

const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required.'),
  leaderId: z.string().min(1, 'A leader is required.'),
  memberIds: z.array(z.string()).min(1, 'At least one member is required.'),
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface AccountabilityGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: GroupFormValues) => void;
  group: AccountabilityGroup | null;
  teamMembers: TeamMember[];
}

export function AccountabilityGroupDialog({
  isOpen,
  onClose,
  onSave,
  group,
  teamMembers,
}: AccountabilityGroupDialogProps) {
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      leaderId: '',
      memberIds: [],
    },
  });

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        leaderId: group.leaderId,
        memberIds: group.memberIds,
      });
    } else {
      form.reset({
        name: '',
        leaderId: '',
        memberIds: [],
      });
    }
  }, [group, isOpen, form]);
  
  const potentialLeaders = teamMembers.filter(m => {
    const roles = Array.isArray(m.role) ? m.role : [m.role];
    return roles.includes('Worship Leader') || roles.includes('Admin');
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{group ? 'Edit Group' : 'Create New Group'}</DialogTitle>
          <DialogDescription>
            {group ? 'Update the details for this group.' : 'Fill out the form to create a new accountability group.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Iron Men" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="leaderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Leader</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a leader" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {potentialLeaders.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="memberIds"
              render={() => (
                <FormItem>
                  <FormLabel>Members</FormLabel>
                   <ScrollArea className="h-48 w-full rounded-md border">
                    <div className="p-4 space-y-4">
                      {teamMembers.map((member) => {
                        const roles = Array.isArray(member.role) ? member.role : [member.role];
                        return (
                        <FormField
                          key={member.id}
                          control={form.control}
                          name="memberIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={member.id}
                                className="flex flex-row items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(member.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), member.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== member.id)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className='flex items-center gap-3'>
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={member.avatarUrl} alt={member.name}/>
                                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <FormLabel className="font-normal">{member.name}</FormLabel>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {roles.map(role => (
                                                <Badge key={role} variant="outline" className="text-xs font-normal">{role}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      )})}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
