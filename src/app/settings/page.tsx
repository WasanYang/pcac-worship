"use client";

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
import { Calendar } from "@/components/ui/calendar"
import { useI18n } from "@/providers/i18n-provider";

export default function SettingsPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
        <p className="text-muted-foreground">
          {t('settingsDesc')}
        </p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="account">{t('account')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('appearance')}</TabsTrigger>
          <TabsTrigger value="availability">{t('availability')}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile')}</CardTitle>
              <CardDescription>
                {t('profileDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input id="name" defaultValue="Worship Leader" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" type="email" defaultValue="admin@prasiri.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>{t('saveChanges')}</Button>
            </CardFooter>
          </Card>
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
                        <Label htmlFor="role">{t('role')}</Label>
                        <Input id="role" defaultValue="Administrator" disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="language">{t('language')}</Label>
                        <p className="text-sm text-muted-foreground">{t('languageNotImpl')}</p>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button>{t('saveChanges')}</Button>
                </CardFooter>
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
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="multiple"
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
