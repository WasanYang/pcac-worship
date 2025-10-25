
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from '@/components/ui/calendar';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CalendarIcon, ListMusic, Users, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { placeholderImages } from '@/lib/placeholder-images.json';
import type { TeamMember, Song } from '@/lib/placeholder-data';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const serviceSchema = z.object({
  theme: z.string().min(1, 'Theme is required'),
  sermonTheme: z.string().optional(),
  date: z.date({
    required_error: 'A date is required.',
  }),
  worshipLeaderId: z.string().min(1, 'Worship leader is required'),
  imageUrl: z.string().url('A banner image is required.').min(1, 'A banner image is required.'),
  teamMemberIds: z.array(z.string()).optional(),
  songIds: z.array(z.string()).optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

const bannerPlaceholders = placeholderImages.filter(p => p.id.startsWith('service') || p.id.startsWith('homeBanner'));

export default function CreateServicePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const teamMembersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'team_members') : null, [firestore]);
  const { data: teamMembers } = useCollection<TeamMember>(teamMembersQuery);
  
  const songsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'songs') : null, [firestore]);
  const { data: songs } = useCollection<Song>(songsQuery);


  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      theme: '',
      sermonTheme: '',
      worshipLeaderId: '',
      imageUrl: '',
      teamMemberIds: [],
      songIds: [],
    },
  });
  
  const selectedBannerUrl = form.watch('imageUrl');
  const selectedTeamMemberIds = form.watch('teamMemberIds') || [];
  const selectedSongIds = form.watch('songIds') || [];

  const onSubmit = async (data: ServiceFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Firestore not available.' });
      return;
    }
    setIsLoading(true);

    try {
      const selectedLeader = teamMembers?.find(m => m.id === data.worshipLeaderId);
      
      const serviceData = {
        theme: data.theme,
        sermonTheme: data.sermonTheme,
        date: data.date.toISOString(),
        worshipLeaderId: data.worshipLeaderId,
        worshipLeaderName: selectedLeader?.name || 'Unknown',
        imageUrl: data.imageUrl,
        songIds: data.songIds || [],
        team: data.teamMemberIds?.map(id => ({
          memberId: id,
          role: teamMembers?.find(m => m.id === id)?.role || 'Team Member'
        })) || [],
      };
      
      const docRef = await addDoc(collection(firestore, 'services'), serviceData);
      await updateDoc(docRef, { id: docRef.id });

      toast({
        title: 'Service Created',
        description: `"${data.theme}" has been added.`,
      });
      router.push('/services');
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: 'Could not create the service. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
       <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/services">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
        </Link>
       </Button>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Service</CardTitle>
            <CardDescription>
              Fill out the form below to add a new service plan.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Banner Selection */}
             <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Service Banner</FormLabel>
                    <FormControl>
                        <div>
                             {selectedBannerUrl && (
                                <div className="mb-4 rounded-lg overflow-hidden aspect-video relative w-full">
                                    <Image src={selectedBannerUrl} alt="Selected Banner" fill className="object-cover"/>
                                </div>
                            )}
                            <ScrollArea className="h-48 w-full">
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pr-4">
                                {bannerPlaceholders.map(p => (
                                    <div key={p.id} onClick={() => field.onChange(p.imageUrl)} className={cn(
                                        "cursor-pointer rounded-md overflow-hidden aspect-square relative border-4 border-transparent",
                                        field.value === p.imageUrl && "border-primary"
                                    )}>
                                        <Image src={p.imageUrl} alt={p.description} fill className="object-cover"/>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

             <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Theme</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sunday Morning Worship" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="sermonTheme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sermon Theme (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Love That Lasts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                   <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="worshipLeaderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Worship Leader</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a worship leader" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamMembers?.filter(m => Array.isArray(m.role) ? m.role.includes("Worship Leader") : m.role === "Worship Leader").map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             {/* Team Selection */}
            <FormField
                control={form.control}
                name="teamMemberIds"
                render={() => (
                    <FormItem>
                        <div className="mb-2">
                           <FormLabel className="text-base font-semibold flex items-center gap-2"><Users /> Schedule Team</FormLabel>
                            <p className="text-sm text-muted-foreground">Select members who will be serving in this service.</p>
                        </div>
                        {selectedTeamMemberIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg mb-4">
                                {selectedTeamMemberIds.map(id => {
                                    const member = teamMembers?.find(m => m.id === id);
                                    if (!member) return null;
                                    return (
                                        <Badge variant="secondary" key={id} className="flex items-center gap-2 text-base p-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={member.avatarUrl} alt={member.name} />
                                                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <span>{member.name}</span>
                                        </Badge>
                                    )
                                })}
                            </div>
                        )}
                        <ScrollArea className="h-60 w-full rounded-md border">
                            <div className="p-4 space-y-4">
                            {teamMembers?.map((member) => (
                                <FormField
                                key={member.id}
                                control={form.control}
                                name="teamMemberIds"
                                render={({ field }) => {
                                    const roles = Array.isArray(member.role) ? member.role : [member.role];
                                    return (
                                    <FormItem
                                        key={member.id}
                                        className="flex flex-row items-center space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(member.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), member.id])
                                                : field.onChange(field.value?.filter((value) => value !== member.id));
                                            }}
                                        />
                                        </FormControl>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={member.avatarUrl} alt={member.name}/>
                                                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <FormLabel className="font-normal">
                                                    {member.name}
                                                </FormLabel>
                                                <div className='flex flex-wrap gap-1 mt-1'>
                                                    {roles.map(role => <Badge key={role} variant="outline" className="text-xs">{role}</Badge>)}
                                                </div>
                                            </div>
                                        </div>
                                    </FormItem>
                                    );
                                }}
                                />
                            ))}
                            </div>
                        </ScrollArea>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {/* Song Selection */}
            <FormField
                control={form.control}
                name="songIds"
                render={() => (
                    <FormItem>
                        <div className="mb-2">
                           <FormLabel className="text-base font-semibold flex items-center gap-2"><ListMusic/> Select Songs</FormLabel>
                            <p className="text-sm text-muted-foreground">Choose the songs for this service's setlist.</p>
                        </div>
                         {selectedSongIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg mb-4">
                                {selectedSongIds.map(id => {
                                    const song = songs?.find(s => s.id === id);
                                    if (!song) return null;
                                    return (
                                        <Badge variant="secondary" key={id} className="text-sm">
                                            {song.title}
                                        </Badge>
                                    )
                                })}
                            </div>
                        )}
                        <ScrollArea className="h-60 w-full rounded-md border">
                            <div className="p-4 space-y-4">
                            {songs?.map((song) => (
                                <FormField
                                key={song.id}
                                control={form.control}
                                name="songIds"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={song.id}
                                        className="flex flex-row items-center space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(song.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), song.id])
                                                : field.onChange(field.value?.filter((value) => value !== song.id));
                                            }}
                                        />
                                        </FormControl>
                                        <div>
                                            <FormLabel className="font-normal">
                                                {song.title}
                                            </FormLabel>
                                            <p className="text-xs text-muted-foreground">by {song.author} • Key: {song.key}</p>
                                        </div>
                                    </FormItem>
                                    );
                                }}
                                />
                            ))}
                            </div>
                        </ScrollArea>
                        <FormMessage />
                    </FormItem>
                )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Service'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
    </div>
  );
}

    