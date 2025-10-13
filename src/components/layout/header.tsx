import { UserNav } from '@/components/layout/user-nav';

export function Header() {
  return (
    <header className='sticky top-0 z-30 flex h-14 items-center gap-4 bg-transparent px-4 sm:px-6'>
      <div className='ml-auto'>
        <UserNav />
      </div>
    </header>
  );
}
