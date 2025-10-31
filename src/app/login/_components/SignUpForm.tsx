'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/firebase';
import { signUpWithEmail, signUpWithGoogle } from '@/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FirebaseError } from 'firebase/app';
import { Eye, EyeOff } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { Role } from '@/lib/placeholder-data';

const formSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

interface SignUpFormProps {
  onGoToSignIn: () => void;
}

export function SignUpForm({ onGoToSignIn }: SignUpFormProps) {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleEmailAuth = async (values: z.infer<typeof formSchema>) => {
    if (!auth) {
      console.error('Auth service is not available.');
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(auth, values.email, values.password, [
        'Team Member',
      ] as Role[]);
    } catch (error) {
      console.error('Email Auth Error:', error);
      let description = 'An unexpected error occurred.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            description = 'An account with this email already exists.';
            break;
          case 'auth/weak-password':
            description =
              'The password is too weak. Please use at least 6 characters.';
            break;
          default:
            description = error.message;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!auth) {
      console.error('Auth service is not available.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      await signUpWithGoogle(auth);
    } catch (error) {
      console.error('Google Auth Error:', error);
      let description = 'An unexpected error occurred.';
      if (error instanceof FirebaseError) {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Google Sign-Up Failed',
        description,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className='w-full max-w-sm'>
      <h2 className='text-4xl font-bold text-center text-foreground'>
        Create Account
      </h2>
      <p className='text-center text-muted-foreground mb-8'>
        Join your team and start collaborating.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleEmailAuth)}
          className='space-y-4'
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='text-left'>
                <FormLabel className='text-foreground/80'>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder='m@example.com'
                    {...field}
                    className='bg-muted/50 border-foreground/20 text-foreground placeholder:text-foreground/50 focus:bg-muted/60 focus-visible:ring-offset-0 focus-visible:ring-primary'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem className='text-left'>
                <FormLabel className='text-foreground/80'>Password</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      {...field}
                      className='bg-muted/50 border-foreground/20 text-foreground placeholder:text-foreground/50 focus:bg-muted/60 focus-visible:ring-offset-0 focus-visible:ring-primary'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute inset-y-0 right-0 flex items-center pr-3'
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4 text-foreground/60' />
                      ) : (
                        <Eye className='h-4 w-4 text-foreground/60' />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem className='text-left'>
                <FormLabel className='text-foreground/80'>
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...field}
                      className='bg-muted/50 border-foreground/20 text-foreground placeholder:text-foreground/50 focus:bg-muted/60 focus-visible:ring-offset-0 focus-visible:ring-primary'
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className='absolute inset-y-0 right-0 flex items-center pr-3'
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4 text-foreground/60' />
                      ) : (
                        <Eye className='h-4 w-4 text-foreground/60' />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            className='w-full text-lg py-6 bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 rounded-full'
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>
      </Form>

      <div className='relative my-6'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t border-foreground/20' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>Or</span>
        </div>
      </div>

      <div className='flex justify-center'>
        <Button
          variant='outline'
          className='rounded-full h-14 w-14'
          onClick={handleGoogleAuth}
          disabled={isLoading || isGoogleLoading}
          aria-label='Register with Google'
        >
          {isGoogleLoading ? '...' : <FaGoogle className='h-6 w-6' />}
        </Button>
      </div>

      <div className='mt-8 text-center text-sm'>
        <p className='text-muted-foreground'>
          Already have an account?{' '}
          <button
            onClick={onGoToSignIn}
            className='font-semibold text-primary hover:underline'
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
