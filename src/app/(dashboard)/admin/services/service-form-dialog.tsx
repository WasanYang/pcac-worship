'use client';

import { useEffect, useMemo, useState } from 'react';
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
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { format } from 'date-fns';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

import Image from 'next/image';
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
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  UploadCloud,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Service, TeamMember } from '@/lib/placeholder-data';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

const serviceFormSchema = z.object({
  theme: z.string().min(2, { message: 'Theme must be at least 2 characters.' }),
  date: z.date({ required_error: 'A date is required.' }),
  worshipLeaderId: z
    .string()
    .min(1, { message: 'Please select a worship leader.' }),
  team: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamMember[]>([]);

  const teamMembersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'team_members') : null),
    [firestore]
  );
  const { data: teamMembers } = useCollection<TeamMember>(teamMembersQuery);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
  });

  useEffect(() => {
    if (open) {
      if (service) {
        form.reset({
          ...service,
          date: new Date(service.date.toDate()),
          worshipLeaderId: service.worshipLeaderId || '',
          imageUrl: service.imageUrl || '',
          imageFile: undefined,
          team: service.team?.map((t) => t.memberId) || [],
        });
        if (teamMembers && service.team) {
          const preselectedTeam = teamMembers.filter((user) =>
            service.team?.some((teamMember) => teamMember.memberId === user.id)
          );
          setSelectedTeam(preselectedTeam);
        }
      } else {
        form.reset({
          theme: '',
          date: new Date(),
          worshipLeaderId: '',
          imageUrl: '',
          imageFile: undefined,
          team: [],
        });
        setSelectedTeam([]);
      }
      setImageFile(null);
      setUploadProgress(null);
    }
  }, [open, service, form]);

  const onSubmit = async (values: ServiceFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);
    setUploadProgress(0);

    let finalImageUrl = values.imageUrl || service?.imageUrl || '';

    try {
      // 1. If a new image file is selected, upload it
      if (imageFile) {
        const storage = getStorage();
        const filePath = `services/${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        finalImageUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error('Upload failed:', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      }

      if (service) {
        const serviceRef = doc(firestore, 'services', service.id);
        const { imageFile, ...rest } = {
          ...values,
          imageUrl: finalImageUrl,
          team: selectedTeam.map((member) => ({
            memberId: member.id,
          })),
          updatedAt: serverTimestamp(),
        };
        console.log(rest);
        await updateDoc(serviceRef, rest);
        toast({
          title: 'Success',
          description: 'Service updated successfully.',
        });
      } else {
        const { imageFile, ...rest } = {
          ...values,
          imageUrl: finalImageUrl,
          team: selectedTeam.map((member) => ({
            memberId: member.id,
          })),
          updatedAt: serverTimestamp(),
        };
        await addDoc(collection(firestore, 'services'), {
          ...rest,
          imageUrl: finalImageUrl, // Use the final image URL
          team: selectedTeam.map((member) => ({
            memberId: member.id,
          })),
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
      setUploadProgress(null);
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
              name='imageUrl'
              render={({ field }) => (
                <FormItem>
                  {/* Image Preview */}
                  <FormLabel>Service Image</FormLabel>
                  <div className='flex flex-col items-center gap-4'>
                    {(field.value || imageFile) && (
                      <div className='relative w-full h-40 rounded-md overflow-hidden border'>
                        <Image
                          src={
                            imageFile
                              ? URL.createObjectURL(imageFile)
                              : field.value || ''
                          }
                          alt='Service Image Preview'
                          fill
                          className='object-cover'
                        />
                      </div>
                    )}
                    <FormControl>
                      <div className='w-full'>
                        <label
                          htmlFor='image-upload'
                          className='flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-md cursor-pointer hover:border-primary hover:bg-accent'
                        >
                          <UploadCloud className='w-5 h-5 mr-2' />
                          <span>
                            {imageFile ? imageFile.name : 'Choose an image'}
                          </span>
                        </label>
                        <Input
                          id='image-upload'
                          type='file'
                          className='hidden'
                          accept='image/*'
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                            }
                            // Clear imageUrl if a new file is selected,
                            // as the new file will be uploaded.
                            form.setValue('imageUrl', '');
                          }}
                        />
                        {/* Button to remove existing image */}
                        {(field.value || imageFile) && (
                          <Button
                            variant='outline'
                            className='mt-2 w-full'
                            onClick={() => {
                              field.onChange(''); // Clear the imageUrl in the form
                              setImageFile(null); // Clear the selected file
                              setUploadProgress(null); // Reset upload progress
                            }}
                          >
                            Remove Image
                          </Button>
                        )}
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploadProgress !== null && uploadProgress < 100 && (
              <div className='space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Uploading... {uploadProgress.toFixed(0)}%
                </p>
                <Progress value={uploadProgress} className='w-full' />
              </div>
            )}
            {uploadProgress === 100 && (
              <p className='text-sm text-green-600'>Upload complete!</p>
            )}
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
              name='worshipLeaderId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Worship Leader</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a worship leader' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers?.map((member) => (
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

            <FormField
              control={form.control}
              name='team'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Members</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-full justify-between h-auto min-h-10',
                            selectedTeam.length === 0 && 'text-muted-foreground'
                          )}
                        >
                          <div className='flex flex-wrap gap-1'>
                            {selectedTeam.length > 0
                              ? selectedTeam.map((member) => (
                                  <Badge
                                    variant='secondary'
                                    key={member.id}
                                    className='mr-1'
                                  >
                                    {member.name}
                                  </Badge>
                                ))
                              : 'Select team members'}
                          </div>
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
                      <Command>
                        <CommandInput placeholder='Search members...' />
                        <CommandList>
                          <CommandEmpty>No members found.</CommandEmpty>
                          <CommandGroup>
                            {teamMembers?.map((member) => {
                              const isSelected = selectedTeam.some(
                                (s) => s.id === member.id
                              );
                              return (
                                <CommandItem
                                  key={member.id}
                                  onSelect={() => {
                                    let newSelectedTeam;
                                    if (isSelected) {
                                      newSelectedTeam = selectedTeam.filter(
                                        (s) => s.id !== member.id
                                      );
                                    } else {
                                      newSelectedTeam = [
                                        ...selectedTeam,
                                        member,
                                      ];
                                    }
                                    setSelectedTeam(newSelectedTeam);
                                    field.onChange(
                                      newSelectedTeam.map((m) => m.id)
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      isSelected ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  {member.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='submit'
                disabled={
                  isSubmitting ||
                  (uploadProgress !== null && uploadProgress < 100)
                }
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
