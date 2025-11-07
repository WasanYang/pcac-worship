'use client';

import MainLayout from '@/components/layout/main-layout';
import { HeaderWrapper } from '@/providers/layout-provider';
import { useI18n } from '@/providers/i18n-provider';

export default function layout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <MainLayout>
      <HeaderWrapper
        title={t('dashboard')}
        subTitle='Here is your personalized dashboard.'
      >
        {children}
      </HeaderWrapper>
    </MainLayout>
  );
}
