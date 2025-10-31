'use client';

import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Hourglass, MailCheck } from 'lucide-react';

export default function WelcomePage() {
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isUserLoading) {
    // You can return a loading spinner here if you want
    return null;
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background text-center p-4'>
      <div className='max-w-lg'>
        <MailCheck className='mx-auto h-16 w-16 text-green-500 mb-6' />
        <h1 className='text-3xl md:text-4xl font-bold text-foreground'>
          Welcome, {user?.displayName || 'there'}!
        </h1>
        <p className='mt-4 text-lg text-muted-foreground'>
          Thank you for registering. Your account has been created successfully.
        </p>

        <div className='mt-6 p-6 bg-muted/50 border border-dashed rounded-lg'>
          <div className='flex items-center justify-center gap-3'>
            <Hourglass className='h-6 w-6 text-amber-500' />
            <h2 className='text-xl font-semibold text-foreground'>
              Awaiting Administrator Approval
            </h2>
          </div>
          <p className='mt-3 text-muted-foreground'>
            To access the dashboard and team features, an administrator needs to
            approve your account. You will be notified once access is granted.
          </p>
        </div>

        <Button onClick={handleLogout} variant='outline' className='mt-8'>
          Log Out & Check Back Later
        </Button>
      </div>
    </div>
  );
}
