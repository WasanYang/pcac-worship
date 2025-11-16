'use client';

import { useI18n } from '@/providers/i18n-provider';
import { HeaderWrapper } from '@/providers/layout-provider';

export default function layout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <HeaderWrapper title={t('profile')} subTitle=''>
      {children}
    </HeaderWrapper>
  );
}
