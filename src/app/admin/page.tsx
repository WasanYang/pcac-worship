"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { teamMembers, Role } from "@/lib/placeholder-data";
import { useI18n } from "@/providers/i18n-provider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signUpWithEmail } from "@/firebase/auth/email";
import { useAuth } from "@/firebase";
import { FirebaseError } from "firebase/app";

const roles: Role[] = ["Admin", "Worship Leader", "Vocalist", "Keys", "Guitar (Acoustic)", "Guitar (Electric)", "Bass", "Drums", "Sound", "Media"];

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  role: z.string().min(1, { message: "Please select a role." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


export default function AdminPage() {
  const { t } = useI18n();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });

  const handleAddMember = async (values: z.infer<typeof formSchema>) => {
    if (!auth) {
        toast({ variant: "destructive", title: "Error", description: "Authentication service not available." });
        return;
    }
    setIsLoading(true);
    try {
        await signUpWithEmail(auth, values.email, values.password, values.role as Role);
        toast({
            title: "User Created",
            description: `A new account for ${values.email} has been created.`,
        });
        form.reset();
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('admin')}</h1>
          <p className="text-muted-foreground">{t('teamMembersDesc')}</p>
        </div>
        
        <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Add New Member</CardTitle>
              <CardDescription>
                Create a new user account and assign them a role.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Member'}</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
