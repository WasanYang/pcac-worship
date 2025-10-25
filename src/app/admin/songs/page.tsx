
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import type { Song } from '@/lib/placeholder-data';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function AdminSongsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const songsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'songs') : null),
    [firestore]
  );
  const { data: songs, isLoading } = useCollection<Song>(songsQuery);

  const handleDeleteSong = async (songId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'songs', songId));
      toast({
        title: 'Song Deleted',
        description: 'The song has been successfully removed.',
      });
    } catch (error) {
      console.error('Error deleting song: ', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the song. Please try again.',
      });
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
            Manage Songs
          </h1>
          <p className='text-muted-foreground'>
            Add, edit, or remove songs from the library.
          </p>
        </div>
        <Button asChild>
          <Link href='/admin/songs/create'>
            <PlusCircle className='mr-2 h-4 w-4' /> Add New Song
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Song Library</CardTitle>
          <CardDescription>
            A list of all songs available in the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Key</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className='text-center'>
                    Loading songs...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && songs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className='text-center'>
                    No songs found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
              {songs?.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className='font-medium'>{song.title}</TableCell>
                  <TableCell>{song.author}</TableCell>
                  <TableCell>{song.key}</TableCell>
                  <TableCell className='text-right'>
                    <Button variant='ghost' size='icon' asChild>
                      <Link href={`/admin/songs/${song.id}`}>
                        <Pencil className='h-4 w-4' />
                        <span className='sr-only'>Edit</span>
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <Trash2 className='h-4 w-4 text-destructive' />
                          <span className='sr-only'>Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the song &quot;{song.title}&quot;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSong(song.id)}
                            className='bg-destructive hover:bg-destructive/90'
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
