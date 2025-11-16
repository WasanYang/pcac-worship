'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useI18n } from '@/providers/i18n-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PeerGroupsList } from './component/PeerGroupsList';
import { TeamMembersList } from './component/TeamMembersList';

export default function TeamPage() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'team';

  const handleTabChange = useCallback(
    (value: string) => {
      router.push(`${pathname}?tab=${value}`);
    },
    [pathname, router]
  );

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='team'>{t('team.tabs.team')}</TabsTrigger>
        <TabsTrigger value='care-groups'>
          {t('team.tabs.care_groups')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value='team' className='mt-4'>
        <TeamMembersList />
      </TabsContent>
      <TabsContent value='care-groups' className='mt-4'>
        <PeerGroupsList />
      </TabsContent>
    </Tabs>
  );
}
