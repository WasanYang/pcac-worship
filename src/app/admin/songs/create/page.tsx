
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useFirestore } from '@/firebase';
import { addDoc, collection }from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
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

export default function CreateSongPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
      
      await addDoc(collection(firestore, 'songs'), songData);

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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Song'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
    </div>
  );
}
