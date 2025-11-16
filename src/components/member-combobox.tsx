'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { TeamMember } from '@/lib/placeholder-data';
import { useI18n } from '@/providers/i18n-provider';

interface MemberComboboxProps {
  members: TeamMember[];
  onSelectMember: (memberId: string) => void;
  selectedMemberId?: string | null;
  triggerText: string;
  triggerIcon?: React.ReactNode;
  isLoading?: boolean;
}

export function MemberCombobox({
  members,
  onSelectMember,
  selectedMemberId,
  triggerText,
  triggerIcon,
  isLoading,
}: MemberComboboxProps) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);

  const selectedMember = members.find(
    (member) => member.id === selectedMemberId
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between'
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : selectedMember ? (
            <div className='flex items-center gap-2'>
              <Avatar className='h-6 w-6'>
                <AvatarImage src={selectedMember.avatarUrl} />
                <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {selectedMember.name}
            </div>
          ) : (
            <div className='flex items-center'>
              {triggerIcon}
              {triggerText}
            </div>
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
        <Command>
          <CommandInput placeholder={t('searchMember')} />
          <CommandList>
            <CommandEmpty>{t('noMemberFound')}</CommandEmpty>
            <CommandGroup>
              {members.map((member) => (
                <CommandItem
                  key={member.id}
                  value={member.name}
                  onSelect={() => {
                    onSelectMember(member.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedMemberId === member.id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {member.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
