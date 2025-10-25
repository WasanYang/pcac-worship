'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/firebase';
import { signInWithEmail, signInWithGoogle } from '@/firebase/auth';
import { useI18n } from '@/providers/i18n-provider';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FirebaseError } from 'firebase/app';
import { Eye, EyeOff } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const { t } = useI18n();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailAuth = async (values: z.infer<typeof formSchema>) => {
    if (!auth) {
      console.error('Auth service is not available.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(auth, values.email, values.password);
      // On success, the AppProvider will redirect to the main app
    } catch (error) {
      console.error('Email Auth Error:', error);
       let description = 'An unexpected error occurred.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = 'Invalid email or password.';
            break;
          case 'auth/email-already-in-use':
            description = 'An account with this email already exists.';
            break;
          default:
            description = error.message;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
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
      await signInWithGoogle(auth);
      // After redirect, AppProvider will handle user creation
    } catch (error) {
       console.error('Google Auth Error:', error);
       let description = 'An unexpected error occurred.';
        if (error instanceof FirebaseError) {
            description = error.message;
        }
        toast({
            variant: 'destructive',
            title: 'Google Sign-In Failed',
            description,
        });
        setIsGoogleLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Prasiri Worship</CardTitle>
          <CardDescription>Sign in to manage your worship team</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailAuth)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} {...field} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading ? 'Loading...' : 'Sign In'}
              </Button>
            </form>
          </Form>

           <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

           <Button variant="outline" className="w-full" onClick={handleGoogleAuth} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? (
              'Redirecting...'
            ) : (
              <>
                <FaGoogle className="mr-2 h-4 w-4" />
                Sign in with Google
              </>
            )}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
