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
                <CardTitle>{t('songLibrary')}</CardTitle>
                <CardDescription>
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
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {t('export')}
              </span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {t('addSong')}
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('song')}</TableHead>
              <TableHead>{t('themes')}</TableHead>
              <TableHead>{t('key')}</TableHead>
              <TableHead>{t('bpm')}</TableHead>
              <TableHead>{t('lastPlayed')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSongs.map((song) => (
              <TableRow key={song.id}>
                <TableCell>
                  <div className="font-medium">{song.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {song.author}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {song.themes.map((theme) => (
                      <Badge key={theme} variant="secondary">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{song.key}</TableCell>
                <TableCell>{song.bpm}</TableCell>
                <TableCell>{song.lastPlayed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
