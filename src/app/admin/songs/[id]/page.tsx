
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Song } from '@/lib/placeholder-data';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SongForm, SongFormValues } from '../_components/SongForm';

export default function EditSongPage() {
  const router = useRouter();
  const params = useParams();
  const songId = params.id as string;

  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const songRef = useMemoFirebase(
    () => (firestore && songId ? doc(firestore, 'songs', songId) : null),
    [firestore, songId]
  );
  const { data: song, isLoading: isSongLoading } = useDoc<Song>(songRef);

  const onSubmit = async (data: SongFormValues) => {
    if (!songRef) {
      toast({ variant: 'destructive', title: 'Song reference not available.' });
      return;
    }
    setIsLoading(true);

    try {
      const updatedData = {
        ...data,
        themes: data.themes ? data.themes.split(',').map(s => s.trim()) : [],
      };

      await updateDoc(songRef, updatedData);

      toast({
        title: 'Song Updated',
        description: `"${data.title}" has been successfully updated.`,
      });
      router.push('/admin/songs');
    } catch (error) {
      console.error('Error updating song:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the song. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSongLoading) {
    return <div className="text-center">Loading song details...</div>;
  }
  
  if (!song && !isSongLoading) {
     return <div className="text-center">Song not found.</div>;
  }

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
            <CardTitle>Edit Song</CardTitle>
            <CardDescription>
            Update the details for &quot;{song?.title}&quot;.
            </CardDescription>
        </CardHeader>
        <SongForm 
            initialData={song}
            onSubmit={onSubmit}
            isLoading={isLoading || isSongLoading}
        />
        </Card>
    </div>
  );
}
