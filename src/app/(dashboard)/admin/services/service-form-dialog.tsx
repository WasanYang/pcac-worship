'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { format } from 'date-fns';

import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Service } from '@/lib/placeholder-data';

const serviceFormSchema = z.object({
  theme: z.string().min(2, { message: 'Theme must be at least 2 characters.' }),
  date: z.date({ required_error: 'A date is required.' }),
  worshipLeaderName: z.string().min(2, { message: 'Leader name is required.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
}: ServiceFormDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
  });

  useEffect(() => {
    if (open) {
      if (service) {
        form.reset({
          ...service,
          date: new Date(service.date),
          imageUrl: service.imageUrl || '',
        });
      } else {
        form.reset({
          theme: '',
          date: new Date(),
          worshipLeaderName: '',
          imageUrl: '',
        });
      }
    }
  }, [open, service, form]);

  const onSubmit = async (values: ServiceFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      if (service) {
        const serviceRef = doc(firestore, 'services', service.id);
        await updateDoc(serviceRef, {
          ...values,
          updatedAt: serverTimestamp(),
        });
        toast({
          title: 'Success',
          description: 'Service updated successfully.',
        });
      } else {
        await addDoc(collection(firestore, 'services'), {
          ...values,
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Success',
          description: 'Service created successfully.',
        });
      }
      onOpenChange(false);
    } catch (e) {
      console.error('Error submitting service:', e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {service ? 'Edit Service' : 'Create Service'}
          </DialogTitle>
          <DialogDescription>
            {service
              ? 'Make changes to the service details.'
              : 'Add a new service to the schedule.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 py-4'
          >
            <FormField
              control={form.control}
              name='theme'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Easter Sunday' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
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
              name='worshipLeaderName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Worship Leader</FormLabel>
                  <FormControl>
                    <Input placeholder='Leader Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='imageUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://example.com/image.jpg'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full sm:w-auto'
              >
                {isSubmitting && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                {service ? 'Save Changes' : 'Create Service'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
