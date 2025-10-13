
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Role } from "@/lib/placeholder-data";
import { useI18n } from "@/providers/i18n-provider";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signUpWithEmail } from "@/firebase/auth/email";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { FirebaseError } from "firebase/app";
import { collection } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import type { TeamMember } from "@/lib/placeholder-data";

const roles: Role[] = ["Admin", "Worship Leader", "Vocalist", "Keys", "Guitar (Acoustic)", "Guitar (Electric)", "Bass", "Drums", "Sound", "Media"];

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  roles: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one role.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


export default function AdminPage() {
  const { t } = useI18n();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const teamMembersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'team_members') : null, [firestore]);
  const { data: allUsers } = useCollection<TeamMember>(teamMembersQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      roles: [],
    },
  });

  const handleAddMember = async (values: z.infer<typeof formSchema>) => {
    if (!auth) {
        toast({ variant: "destructive", title: "Error", description: "Authentication service not available." });
        return;
    }
    setIsLoading(true);
    try {
        await signUpWithEmail(auth, values.email, values.password, values.roles as Role[]);
        toast({
            title: "User Created",
            description: `A new account for ${values.email} has been created.`,
        });
        form.reset();
        setIsDialogOpen(false);
    } catch (error) {
        console.error("Error creating user:", error);
        let description = "An unexpected error occurred.";
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    description = 'An account with this email already exists.';
                    break;
                case 'auth/weak-password':
                    description = 'The password is too weak.';
                    break;
                default:
                    description = error.message;
            }
        }
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description,
        });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('admin')}</h1>
            <p className="text-muted-foreground">{t('teamMembersDesc')}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> {t('addMember')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Create a new user account and assign them roles.
                </DialogDescription>
              </DialogHeader>
               <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddMember)} className="space-y-4">
                      <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                      <Input placeholder="name@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                      <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                      <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="roles"
                          render={() => (
                              <FormItem>
                                  <div className="mb-4">
                                      <FormLabel className="text-base">Roles</FormLabel>
                                  </div>
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {roles.map((item) => (
                                      <FormField
                                      key={item}
                                      control={form.control}
                                      name="roles"
                                      render={({ field }) => {
                                          return (
                                          <FormItem
                                              key={item}
                                              className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                              <FormControl>
                                              <Checkbox
                                                  checked={field.value?.includes(item)}
                                                  onCheckedChange={(checked) => {
                                                  return checked
                                                      ? field.onChange([...(field.value || []), item])
                                                      : field.onChange(
                                                          field.value?.filter(
                                                          (value) => value !== item
                                                          )
                                                      )
                                                  }}
                                              />
                                              </FormControl>
                                              <FormLabel className="font-normal">
                                              {item}
                                              </FormLabel>
                                          </FormItem>
                                          )
                                      }}
                                      />
                                  ))}
                                  </div>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <Button type="submit" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Member'}</Button>
                  </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
            <CardHeader>
              <CardTitle>All System Users</CardTitle>
              <CardDescription>
                List of all users in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roles</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allUsers?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait"/>
                                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{user.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {(Array.isArray(user.role) ? user.role : [user.role]).map(role => (
                                            <Badge key={role} variant="secondary">{role}</Badge>
                                        ))}
                                    </div>
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
