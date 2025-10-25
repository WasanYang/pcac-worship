"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/providers/i18n-provider";
import { Languages, LogOut, Settings, User as UserIcon, Shield, ChevronRight, ListMusic } from "lucide-react";
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { doc } from "firebase/firestore";
import type { TeamMember } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "../ui/separator";

export function UserNav() {
  const { setLocale, t } = useI18n();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const teamMemberRef = useMemoFirebase(() => user ? doc(firestore, 'team_members', user.uid) : null, [firestore, user]);
  const { data: teamMember } = useDoc<TeamMember>(teamMemberRef);
  
  const isAdmin = Array.isArray(teamMember?.role) && teamMember.role.includes('Admin');


  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('');
  }

  const userRoles = Array.isArray(teamMember?.role) ? teamMember.role : (teamMember?.role ? [teamMember.role] : []);

  return (
    <div className="z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.photoURL || teamMember?.avatarUrl || ''} alt={user?.displayName || ''} data-ai-hint="person portrait" />
              <AvatarFallback>{getInitials(user?.displayName || teamMember?.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full max-w-xs p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="font-normal text-left">
               <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.photoURL || teamMember?.avatarUrl || ''} alt={user?.displayName || ''} data-ai-hint="person portrait" />
                  <AvatarFallback>{getInitials(user?.displayName || teamMember?.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{teamMember?.name || user?.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            
            <p className="text-xs font-medium text-muted-foreground px-2">ROLES</p>
            {userRoles.length > 0 && (
                <div className="flex flex-wrap gap-1 px-2 pb-2">
                    {userRoles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                    ))}
                </div>
            )}
            
            <Separator />
            
             <div className="space-y-1 pt-2">
                <p className="text-xs font-medium text-muted-foreground px-2">MENU</p>
                <Link href="/settings" className="flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm">
                    <div className="flex items-center gap-3">
                        <UserIcon className="h-4 w-4" />
                        <span>{t('profile')}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                </Link>
                <Link href="/settings" className="flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm">
                    <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4" />
                        <span>{t('settings')}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                </Link>
                 {isAdmin && (
                   <>
                    <Link href="/admin" className="flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm">
                        <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4" />
                            <span>{t('admin')}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                    </Link>
                    <Link href="/admin/songs" className="flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm">
                        <div className="flex items-center gap-3">
                            <ListMusic className="h-4 w-4" />
                            <span>Songs</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                    </Link>
                   </>
                )}
             </div>
             
             <Separator />

            <div className="space-y-1 pt-2">
                <p className="text-xs font-medium text-muted-foreground px-2">PREFERENCES</p>
                <div className="p-2 rounded-md text-sm">
                    <ThemeToggle />
                </div>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm cursor-pointer">
                    <div className="flex items-center gap-3">
                        <Languages className="h-4 w-4" />
                        <span>{t('language')}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">English</span>
                </div>
             </div>


          </div>
          <div className="p-4 border-t">
              <Button variant="ghost" className="w-full justify-start p-2 text-sm" onClick={handleLogout}>
                <LogOut className="mr-3 h-4 w-4" />
                {t('logOut')}
              </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
