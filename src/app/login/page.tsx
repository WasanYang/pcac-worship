'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import { signInWithGoogle } from '@/firebase/auth/sign-in';
import { useI18n } from '@/providers/i18n-provider';

export default function LoginPage() {
    const { t } = useI18n();
    const auth = useAuth();

  const handleSignIn = async () => {
    if (auth) {
      await signInWithGoogle(auth);
    } else {
        console.error("Auth service is not available.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Prasiri Worship</CardTitle>
          <CardDescription>Sign in to manage your worship team</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleSignIn}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 102.3 279.2 88 248 88c-73.2 0-132.3 59.2-132.3 132.3s59.1 132.3 132.3 132.3c76.9 0 111.2-51.8 115.8-77.9H248v-64.8h235.5c3 12.7 4.5 26.8 4.5 41.8z"></path></svg>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
