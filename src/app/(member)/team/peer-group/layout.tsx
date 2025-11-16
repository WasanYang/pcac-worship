'use client';

import { HeaderWrapper } from '@/providers/layout-provider';
import { useI18n } from '@/providers/i18n-provider';

export default function layout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <HeaderWrapper title={t('peer_groups.detail.title')} subTitle=''>
      {children}
    </HeaderWrapper>
  );
}
