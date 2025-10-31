
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Song } from '@/lib/placeholder-data';
import { recentSongs } from '@/lib/placeholder-data'; // Using placeholder for now
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Youtube, User, ListMusic } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined }) {
  if (!value) return null;
  return (
    <div className='flex items-start gap-3 rounded-lg bg-muted/50 p-3'>
        <Icon className='h-5 w-5 mt-1 flex-shrink-0 text-muted-foreground' />
        <div>
            <p className='text-sm font-semibold text-muted-foreground'>{label}</p>
            <p className='text-base font-medium'>{value}</p>
        </div>
    </div>
  )
}

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const songId = params.id as string;
  
  // In a real app, you would fetch from Firestore like this:
  // const firestore = useFirestore();
  // const songRef = useMemoFirebase(
  //   () => (firestore && songId ? doc(firestore, 'songs', songId) : null),
  //   [firestore, songId]
  // );
  // const { data: song, isLoading } = useDoc<Song>(songRef);

  // For demonstration, we'll find the song in the placeholder data.
  const song = recentSongs.find((s) => s.id === songId);
  const isLoading = false; // Mock loading state

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent'></div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className='flex flex-col items-center justify-center text-center gap-4'>
        <h2 className='text-2xl font-semibold'>Song Not Found</h2>
        <p>The song you are looking for does not exist.</p>
        <Button onClick={() => router.push('/songs')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Song Library
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-8'>
       <Button variant="outline" size="sm" className="self-start" asChild>
            <Link href="/songs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Songs
            </Link>
       </Button>
        
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2 flex flex-col gap-6'>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl md:text-3xl">{song.title}</CardTitle>
                        <CardDescription className="text-base">by {song.author}</CardDescription>
                        {song.themes && song.themes.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                            {song.themes.map((theme) => (
                                <Badge key={theme} variant="secondary">
                                {theme}
                                </Badge>
                            ))}
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                            <DetailItem icon={ListMusic} label="Key" value={song.key} />
                            <DetailItem icon={ListMusic} label="BPM" value={song.bpm} />
                            <DetailItem icon={ListMusic} label="CCLI Number" value={song.ccli} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl md:text-2xl">Usage History</CardTitle>
                        <CardDescription>When this song has been used in services.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {song.usage && song.usage.length > 0 ? (
                            <ul className='space-y-4'>
                                {song.usage.map((use, index) => (
                                    <li key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-muted/50">
                                        <div>
                                            <p className='font-medium'>{use.service}</p>
                                            <p className='text-sm text-muted-foreground flex items-center gap-2'>
                                                <Calendar className='h-4 w-4' />
                                                {new Date(use.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className='text-sm text-muted-foreground flex items-center gap-2'>
                                            <User className='h-4 w-4' />
                                            Led by {use.worshipLeader}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-lg bg-muted/50">
                                <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                                <h3 className="text-lg font-semibold">No Usage History</h3>
                                <p className="text-sm text-muted-foreground">This song hasn't been used in a service yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className='lg:col-span-1'>
                 <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle className="text-xl md:text-2xl">Resources</CardTitle>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-3'>
                         <Button variant="outline" className='w-full' disabled>
                            <ListMusic className='mr-2' /> Chord Chart (PDF)
                        </Button>
                         <Button variant="outline" className='w-full' disabled>
                            <Youtube className='mr-2' /> Watch on YouTube
                        </Button>
                    </CardContent>
                </Card>
            </div>

        </div>

    </div>
  );
}

