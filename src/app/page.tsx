"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HeartHandshake, ListMusic, Users, CalendarDays } from "lucide-react";
import { recentSongs, upcomingServices, teamMembers, accountabilityGroups } from "@/lib/placeholder-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useI18n } from "@/providers/i18n-provider";

export default function Dashboard() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSongs')}</CardTitle>
            <ListMusic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentSongs.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('inYourLibrary')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('upcomingServices')}
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingServices.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('thisMonth')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('teamMembers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('activeInTheTeam')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('activeGroups')}
            </CardTitle>
            <HeartHandshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountabilityGroups.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('forPeerAccountability')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingServices')}</CardTitle>
            <CardDescription>
              {t('upcomingServicesDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('service')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('worshipLeader')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingServices.slice(0, 5).map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="font-medium">{service.theme}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.sermonTheme}
                      </div>
                    </TableCell>
                    <TableCell>{service.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={teamMembers.find(m => m.name === service.worshipLeader)?.avatarUrl} alt={service.worshipLeader} />
                            <AvatarFallback>{service.worshipLeader.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{service.worshipLeader}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('recentlyAddedSongs')}</CardTitle>
            <CardDescription>
              {t('recentlyAddedSongsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSongs.slice(0, 5).map((song) => (
                <div key={song.id} className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <ListMusic className="h-5 w-5" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {song.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {song.author}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">{song.key}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
