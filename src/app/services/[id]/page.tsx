
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import type { Service, Song, TeamMember } from '@/lib/placeholder-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, ListMusic, Users, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params.id as string;
  
  const firestore = useFirestore();
  const serviceRef = useMemoFirebase(
    () => (firestore && serviceId ? doc(firestore, 'services', serviceId) : null),
    [firestore, serviceId]
  );
  const { data: service, isLoading } = useDoc<Service>(serviceRef);

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent'></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className='flex flex-col items-center justify-center text-center gap-4'>
        <h2 className='text-2xl font-semibold'>Service Not Found</h2>
        <p>The service you are looking for does not exist.</p>
        <Button asChild>
          <Link href="/services">
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Services
          </Link>
        </Button>
      </div>
    );
  }
  
  const serviceDate = service.date instanceof Timestamp ? service.date.toDate() : new Date(service.date);


  return (
    <div className='flex flex-col gap-8'>
       <Button variant="outline" size="sm" className="self-start" asChild>
            <Link href="/services">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Services
            </Link>
       </Button>
        
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-1 flex flex-col gap-6'>
                 <Card className="overflow-hidden">
                    <div className="relative w-full h-60">
                        <Image src={service.imageUrl} alt={service.theme} fill className="object-cover" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl md:text-2xl">{service.theme}</CardTitle>
                        <CardDescription>{service.sermonTheme}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{serviceDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Led by <span className="font-semibold text-foreground">{service.worshipLeaderName}</span></span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className='lg:col-span-2 flex flex-col gap-6'>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl md:text-2xl flex items-center gap-2"><ListMusic /> Setlist</CardTitle>
                            <CardDescription>The songs planned for this service.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Songs</Button>
                    </CardHeader>
                    <CardContent>
                         <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-muted/50">
                            <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No Songs Added</h3>
                            <p className="text-sm text-muted-foreground">Add songs to build your setlist for this service.</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl md:text-2xl flex items-center gap-2"><Users /> Team</CardTitle>
                            <CardDescription>The team scheduled for this service.</CardDescription>
                        </div>
                         <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Schedule Team</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-muted/50">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No Team Scheduled</h3>
                            <p className="text-sm text-muted-foreground">Schedule your team members for their roles.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>

    </div>
  );
}
