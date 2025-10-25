
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Song } from '@/lib/placeholder-data';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const songSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  key: z.string().min(1, 'Key is required'),
  themes: z.string().optional(),
  bpm: z.coerce.number().optional(),
  ccliNumber: z.string().optional(),
  youtubeLink: z.string().url().optional().or(z.literal('')),
});

type SongFormValues = z.infer<typeof songSchema>;

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

  const form = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: '',
      author: '',
      key: '',
      themes: '',
      bpm: undefined,
      ccliNumber: '',
      youtubeLink: '',
    },
  });

  useEffect(() => {
    if (song) {
      form.reset({
        ...song,
        themes: Array.isArray(song.themes) ? song.themes.join(', ') : song.themes,
      });
    }
  }, [song, form]);

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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className='space-y-4'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Goodness of God" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Bethel Music" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Key</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., G" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bpm"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>BPM (Beats Per Minute)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 126" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="ccliNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>CCLI Number</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., 7117726" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <FormField
                    control={form.control}
                    name="themes"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Themes</FormLabel>
                        <FormControl>
                        <Textarea placeholder="e.g., Goodness, Faithfulness, Grace" {...field} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">Separate themes with a comma.</p>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="youtubeLink"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>YouTube Link</FormLabel>
                        <FormControl>
                        <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading || isSongLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardFooter>
            </form>
        </Form>
        </Card>
    </div>
  );
}
