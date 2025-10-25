
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
import { Button } from "@/components/ui/button";
import { recentSongs } from "@/lib/placeholder-data";
import { PlusCircle, File, ListFilter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/providers/i18n-provider";

export default function SongsPage() {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
            <div>
                <CardTitle className="text-xl md:text-2xl font-semibold leading-none tracking-tight">{t('songLibrary')}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                {t('songLibraryDesc')}
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    {t('filter')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('filterBy')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  {t('contemporary')}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>{t('hymn')}</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  {t('gospel')}
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('song')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('themes')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('key')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('lastPlayed')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSongs.map((song) => (
              <TableRow key={song.id}>
                <TableCell>
                  <div className="font-medium">{song.title}</div>
                  <div className="text-sm text-muted-foreground md:hidden">
                    {song.author} &middot; {song.key}
                  </div>
                   <div className="text-sm text-muted-foreground hidden md:inline">
                    {song.author}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {song.themes.map((theme) => (
                      <Badge key={theme} variant="secondary">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{song.key}</TableCell>
                <TableCell className="hidden md:table-cell">{song.lastPlayed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
