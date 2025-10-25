
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useI18n } from "@/providers/i18n-provider";
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from "@/firebase";
import type { TeamMember } from "@/lib/placeholder-data";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Calendar as CalendarIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatarUrl: z.string().optional(),
});

export default function SettingsPage() {
  const { t } = useI18n();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [isSavingBlockout, setIsSavingBlockout] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const teamMemberRef = useMemoFirebase(
    () => (user ? doc(firestore, "team_members", user.uid) : null),
    [firestore, user]
  );
  const { data: teamMember, isLoading: isTeamMemberLoading } = useDoc<TeamMember>(teamMemberRef);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    values: {
      name: teamMember?.name || "",
      avatarUrl: teamMember?.avatarUrl || "",
    },
  });

  useEffect(() => {
    if (teamMember) {
      profileForm.reset({ name: teamMember.name, avatarUrl: teamMember.avatarUrl });
      if (teamMember.blockoutDates) {
        const dates = teamMember.blockoutDates.map(d => {
            const [year, month, day] = d.split('-').map(Number);
            return new Date(year, month - 1, day);
        }).sort((a,b) => a.getTime() - b.getTime());
        setSelectedDates(dates);
      }
      setImagePreview(teamMember.avatarUrl);
    }
  }, [teamMember, profileForm]);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 2MB."
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        profileForm.setValue('avatarUrl', result);
        setImagePreview(result);
      };
      reader.onerror = () => {
         toast({
          variant: "destructive",
          title: "Error reading file",
          description: "Could not read the selected image file."
        });
      }
      reader.readAsDataURL(file);
    }
  };


  const handleProfileUpdate = async (values: z.infer<typeof profileFormSchema>) => {
    if (!teamMemberRef || !user) return;
    setIsLoading(true);
    try {
      // Update Firestore document
      await updateDoc(teamMemberRef, {
        name: values.name,
        avatarUrl: values.avatarUrl,
      });
      
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: values.name,
          photoURL: values.avatarUrl,
        });
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBlockoutDates = async () => {
    if (!teamMemberRef) return;
    setIsSavingBlockout(true);
    try {
        const dateStrings = selectedDates?.map(date => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        });
        await updateDoc(teamMemberRef, {
            blockoutDates: dateStrings
        });
        toast({
            title: "Blockout Dates Saved",
            description: "Your availability has been updated."
        });
    } catch (error) {
        console.error("Error saving blockout dates:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your blockout dates. Please try again."
        });
    } finally {
        setIsSavingBlockout(false);
    }
  };
  
    const handleDateSelect = (dates: Date[] | undefined) => {
        if (!dates) {
            setSelectedDates([]);
            return;
        }
        const sortedDates = dates.sort((a,b) => a.getTime() - b.getTime());
        setSelectedDates(sortedDates);
    }

    const removeDate = (dateToRemove: Date) => {
        setSelectedDates(prev => prev?.filter(date => date.getTime() !== dateToRemove.getTime()));
    }


  const userRoles = Array.isArray(teamMember?.role) ? teamMember.role : (teamMember?.role ? [teamMember.role] : []);


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('settings')}</h1>
        <p className="text-muted-foreground">
          {t('settingsDesc')}
        </p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="account">{t('account')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('appearance')}</TabsTrigger>
          <TabsTrigger value="availability">{t('availability')}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile')}</CardTitle>
                  <CardDescription>
                    {t('profileDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={profileForm.control}
                        name="avatarUrl"
                        render={() => (
                           <FormItem className="flex flex-col items-center text-center gap-4">
                            <FormLabel>Profile Picture</FormLabel>
                            <FormControl>
                                 <div className="relative">
                                    <Avatar className="w-24 h-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <AvatarImage src={imagePreview || undefined} alt={teamMember?.name} />
                                        <AvatarFallback>{teamMember?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div 
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </FormControl>
                             <Input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload}
                                accept="image/png, image/jpeg, image/webp"
                            />
                            <FormMessage />
                           </FormItem>
                        )}
                    />
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('name')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input id="email" type="email" value={teamMember?.email || ""} disabled />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button type="submit" disabled={isLoading || isTeamMemberLoading}>
                    {isLoading ? "Saving..." : t('saveChanges')}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="account">
            <Card>
                <CardHeader>
                    <CardTitle>{t('account')}</CardTitle>
                    <CardDescription>
                        {t('accountDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('role')}</Label>
                         <div className="flex flex-wrap gap-2">
                           {userRoles.length > 0 ? (
                              userRoles.map(role => <Badge key={role} variant="secondary">{role}</Badge>)
                           ) : (
                              <p className="text-sm text-muted-foreground">No roles assigned.</p>
                           )}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="language">{t('language')}</Label>
                        <p className="text-sm text-muted-foreground">{t('languageNotImpl')}</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="appearance">
             <Card>
                <CardHeader>
                    <CardTitle>{t('appearance')}</CardTitle>
                    <CardDescription>
                        {t('appearanceDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{t('themeSettingsLocation')}</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="availability">
             <Card>
                <CardHeader>
                    <CardTitle>{t('blockoutDates')}</CardTitle>
                    <CardDescription>
                        {t('blockoutDatesDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="flex justify-center">
                        <Calendar
                            mode="multiple"
                            selected={selectedDates}
                            onSelect={handleDateSelect}
                            className="rounded-md border"
                            disabled={isTeamMemberLoading}
                        />
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Selected Dates</h4>
                        <ScrollArea className="h-64 pr-4">
                            <div className="flex flex-col gap-2">
                                <AnimatePresence>
                                {selectedDates && selectedDates.length > 0 ? (
                                    selectedDates.map(date => (
                                        <motion.div
                                            key={date.toString()}
                                            layout
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                        >
                                            <Badge variant="secondary" className="flex items-center justify-between w-full text-sm py-2 px-3">
                                                <span>{date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                <button onClick={() => removeDate(date)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                                    <X className="h-3 w-3"/>
                                                </button>
                                            </Badge>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted-foreground py-10 px-4">
                                        <CalendarIcon className="mx-auto h-10 w-10 mb-2"/>
                                        <p>Click on the calendar to add blockout dates.</p>
                                    </div>
                                )}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    </div>
                </CardContent>
                 <CardFooter className="justify-end">
                    <Button onClick={handleSaveBlockoutDates} disabled={isSavingBlockout || isTeamMemberLoading}>
                        {isSavingBlockout ? 'Saving...' : 'Save Blockout Dates'}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    