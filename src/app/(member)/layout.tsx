import MainLayout from '@/components/layout/main-layout';

export default function layout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
