'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import type { TeamMember } from '@/lib/placeholder-data';
import { useI18n } from '@/providers/i18n-provider';

interface MultiMemberComboboxProps {
  members: TeamMember[];
  selectedMemberIds: string[];
  onSelectedMemberIdsChange: (ids: string[]) => void;
  placeholder: string;
  isLoading?: boolean;
}

export function MultiMemberCombobox({
  members,
  selectedMemberIds,
  onSelectedMemberIdsChange,
  placeholder,
  isLoading,
}: MultiMemberComboboxProps) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);

  const handleSelect = (memberId: string) => {
    const newSelectedIds = selectedMemberIds.includes(memberId)
      ? selectedMemberIds.filter((id) => id !== memberId)
      : [...selectedMemberIds, memberId];
    onSelectedMemberIdsChange(newSelectedIds);
  };

  const selectedMembers = members.filter((member) =>
    selectedMemberIds.includes(member.id)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between h-auto min-h-10'
          disabled={isLoading}
        >
          <div className='flex gap-1 flex-wrap'>
            {selectedMembers.length > 0 ? (
              selectedMembers.map((member) => (
                <Badge
                  variant='secondary'
                  key={member.id}
                  className='mr-1'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(member.id);
                  }}
                >
                  {member.name}
                  <X className='ml-1 h-3 w-3' />
                </Badge>
              ))
            ) : (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
          </div>
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
                    handleSelect(member.id);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedMemberIds.includes(member.id)
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
