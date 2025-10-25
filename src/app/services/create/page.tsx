
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
import { Calendar } from '@/components/ui/calendar';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { placeholderImages } from '@/lib/placeholder-images.json';

const serviceSchema = z.object({
  theme: z.string().min(1, 'Theme is required'),
  sermonTheme: z.string().optional(),
  date: z.date({
    required_error: 'A date is required.',
  }),
  worshipLeader: z.string().min(1, 'Worship leader is required'),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function CreateServicePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      theme: '',
      sermonTheme: '',
      worshipLeader: '',
    },
  });

  const onSubmit = async (data: ServiceFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Firestore not available.' });
      return;
    }
    setIsLoading(true);

    try {
      const serviceData = {
        ...data,
        date: data.date.toISOString(),
        imageUrl: placeholderImages.find(p => p.id.startsWith('service'))?.imageUrl || 'https://picsum.photos/seed/service/600/400',
        team: [],
        setlist: [],
      };
      
      const docRef = await addDoc(collection(firestore, 'services'), serviceData);
      
      // Since Firestore doesn't automatically add the ID to the document data,
      // you might want to do this in a real app, but it's not strictly necessary
      // for this form.
      // await updateDoc(docRef, { id: docRef.id });

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
    <Card>
      <CardHeader>
        <CardTitle>Create a New Service</CardTitle>
        <CardDescription>
          Fill out the form below to add a new service plan.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
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
                name="worshipLeader"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Worship Leader</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alex Ray" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Service'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
    </div>
  );
}
