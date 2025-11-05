import { HeaderWrapper } from '@/providers/layout-provider';

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <HeaderWrapper title='Services' subTitle=''>
      {children}
    </HeaderWrapper>
  );
}
