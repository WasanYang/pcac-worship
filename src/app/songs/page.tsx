
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { ListFilter, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/providers/i18n-provider";

export default function SongsPage() {
  const { t } = useI18n();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const totalPages = Math.ceil(recentSongs.length / rowsPerPage);

  const paginatedSongs = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return recentSongs.slice(startIndex, endIndex);
  }, [currentPage, rowsPerPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page
  };


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
            {paginatedSongs.map((song) => (
              <TableRow key={song.id}>
                <TableCell>
                  <div className="font-medium">{song.title}</div>
                  <div className="text-xs text-muted-foreground md:hidden">
                    {song.author} &middot; {song.key} &middot; {song.lastPlayed}
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
                <TableCell className="hidden md:table-cell">
                    <div>{song.lastPlayed}</div>
                    <div className="text-xs text-muted-foreground">{song.lastUsedBy}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
         <div className="text-xs text-muted-foreground">
            Showing{" "}
            <strong>
              {Math.min((currentPage - 1) * rowsPerPage + 1, recentSongs.length)}-
              {Math.min(currentPage * rowsPerPage, recentSongs.length)}
            </strong>{" "}
            of <strong>{recentSongs.length}</strong> songs
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
            <p className="text-xs font-medium">Rows per page</p>
            <Select
              value={`${rowsPerPage}`}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={`${rowsPerPage}`} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 15, 20].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs font-semibold">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
