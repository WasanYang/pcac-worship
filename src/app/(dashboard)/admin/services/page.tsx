'use client';

import { useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { useI18n } from '@/providers/i18n-provider';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, MoreHorizontal, PlusCircle } from 'lucide-react';
import { Service } from '@/lib/placeholder-data';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServiceFormDialog } from './service-form-dialog';

const serviceFormSchema = z.object({
  theme: z.string().min(2, { message: 'Theme must be at least 2 characters.' }),
  date: z.date({ required_error: 'A date is required.' }),
  worshipLeaderName: z.string().min(2, { message: 'Leader name is required.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function AdminServicesPage() {
  const { t } = useI18n();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const servicesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'services') : null),
    [firestore]
  );

  const {
    data: allServices,
    isLoading,
    error,
  } = useCollection<Service>(servicesCollection);

  const sortedServices = useMemo(() => {
    if (!allServices) return [];
    return [...allServices].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [allServices]);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      theme: '',
      worshipLeaderName: '',
      imageUrl: '',
    },
  });

  const handleOpenDialog = (service: Service | null = null) => {
    setEditingService(service);
    if (service) {
      form.reset({
        ...service,
        date: new Date(service.date),
      });
    } else {
      form.reset({
        theme: '',
        date: new Date(),
        worshipLeaderName: '',
        imageUrl: '',
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = async (values: ServiceFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      if (editingService) {
        const serviceRef = doc(firestore, 'services', editingService.id);
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
      setDialogOpen(false);
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

  const handleDelete = async (serviceId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'services', serviceId));
      toast({ title: 'Success', description: 'Service deleted successfully.' });
    } catch (e) {
      console.error('Error deleting service:', e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete service. Please try again.',
      });
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
            Manage Services
          </h1>
          <p className='text-muted-foreground'>
            Create, edit, and manage all worship services.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className='mr-2 h-4 w-4' /> Create Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
          <CardDescription>A list of all scheduled services.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Theme</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className='text-center'>
                    <Loader2 className='mx-auto h-6 w-6 animate-spin' />
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='text-center text-destructive'
                  >
                    Error loading services.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                sortedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className='font-medium'>
                      {service.theme}
                    </TableCell>
                    <TableCell>
                      {new Date(service.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{service.worshipLeaderName}</TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog(service)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className='text-destructive'
                              >
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the service &quot;
                                  {service.theme}&quot;.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(service.id)}
                                  className='bg-destructive hover:bg-destructive/90'
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ServiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editingService}
      />
    </div>
  );
}
