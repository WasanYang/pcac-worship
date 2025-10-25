'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CardContent,
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
import type { Song } from '@/lib/placeholder-data';
import { useEffect } from 'react';

const songSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  key: z.string().min(1, 'Key is required'),
  themes: z.string().optional(),
  bpm: z.coerce.number().optional(),
  ccliNumber: z.string().optional(),
  youtubeLink: z.string().url().optional().or(z.literal('')),
});

export type SongFormValues = z.infer<typeof songSchema>;

interface SongFormProps {
  initialData?: Partial<Song> | null;
  onSubmit: (data: SongFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function SongForm({ initialData, onSubmit, isLoading = false }: SongFormProps) {
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
    if (initialData) {
      form.reset({
        ...initialData,
        themes: Array.isArray(initialData.themes)
          ? initialData.themes.join(', ')
          : initialData.themes || '',
      });
    }
  }, [initialData, form]);

  const buttonText = initialData ? 'Save Changes' : 'Create Song';
  const loadingText = initialData ? 'Saving...' : 'Creating...';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
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
                    <Input type="number" placeholder="e.g., 126" {...field} value={field.value ?? ''} />
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
                    <Input placeholder="e.g., 7117726" {...field} value={field.value ?? ''}/>
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
                  <Textarea
                    placeholder="e.g., Goodness, Faithfulness, Grace"
                    {...field}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Separate themes with a comma.
                </p>
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
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? loadingText : buttonText}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
