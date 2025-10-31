
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { addDoc, collection, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SongForm, SongFormValues } from '../_components/SongForm';

export default function CreateSongPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: SongFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Firestore not available.' });
      return;
    }
    setIsLoading(true);

    try {
      const songData = {
        ...data,
        themes: data.themes ? data.themes.split(',').map(s => s.trim()) : [],
        lastPlayed: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(firestore, 'songs'), songData);
      await updateDoc(docRef, { id: docRef.id });

      toast({
        title: 'Song Created',
        description: `"${data.title}" has been added to the library.`,
      });
      router.push('/admin/songs');
    } catch (error) {
      console.error('Error creating song:', error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: 'Could not create the song. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/admin/songs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Songs
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Add a New Song</CardTitle>
          <CardDescription>
            Fill out the form below to add a new song to the song library.
          </CardDescription>
        </CardHeader>
        <SongForm onSubmit={onSubmit} isLoading={isLoading} />
      </Card>
    </div>
  );
}
