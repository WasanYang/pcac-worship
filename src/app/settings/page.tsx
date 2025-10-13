
"use client";

import { useState, useEffect } from "react";
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
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import type { TeamMember } from "@/lib/placeholder-data";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default function SettingsPage() {
  const { t } = useI18n();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [isSavingBlockout, setIsSavingBlockout] = useState(false);

  const teamMemberRef = useMemoFirebase(
    () => (user ? doc(firestore, "team_members", user.uid) : null),
    [firestore, user]
  );
  const { data: teamMember, isLoading: isTeamMemberLoading } = useDoc<TeamMember>(teamMemberRef);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    values: {
      name: teamMember?.name || "",
    },
  });

  // Effect to update forms when teamMember data loads
  useEffect(() => {
    if (teamMember) {
      profileForm.reset({ name: teamMember.name });
      if (teamMember.blockoutDates) {
        setSelectedDates(teamMember.blockoutDates.map(d => new Date(d)));
      }
    }
  }, [teamMember, profileForm]);

  const handleProfileUpdate = async (values: z.infer<typeof profileFormSchema>) => {
    if (!teamMemberRef) return;
    setIsLoading(true);
    try {
      await updateDoc(teamMemberRef, {
        name: values.name,
      });
      toast({
        title: "Profile Updated",
        description: "Your name has been successfully updated.",
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
        const dateStrings = selectedDates?.map(date => date.toISOString().split('T')[0]);
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
  
  const userRoles = Array.isArray(teamMember?.role) ? teamMember.role : (teamMember?.role ? [teamMember.role] : []);


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
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
                <CardContent className="space-y-4">
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
                <CardFooter>
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
                <CardContent className="flex flex-col items-center gap-4">
                    <Calendar
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={setSelectedDates}
                        className="rounded-md border"
                        disabled={isTeamMemberLoading}
                    />
                    {selectedDates && selectedDates.length > 0 && (
                        <div className="w-full max-w-md rounded-lg border p-4">
                            <h4 className="font-semibold mb-2">Your selected blockout dates:</h4>
                            <ul className="list-disc pl-5 text-sm">
                                {selectedDates.map(date => (
                                    <li key={date.toString()}>{date.toLocaleDateString()}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
                 <CardFooter>
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
