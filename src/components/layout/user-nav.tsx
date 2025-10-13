"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/providers/i18n-provider";
import { Languages, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { doc } from "firebase/firestore";
import type { TeamMember } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";

export function UserNav() {
  const { setLocale, t } = useI18n();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const teamMemberRef = useMemoFirebase(() => user ? doc(firestore, 'team_members', user.uid) : null, [firestore, user]);
  const { data: teamMember } = useDoc<TeamMember>(teamMemberRef);


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
    <div className="z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.photoURL || teamMember?.avatarUrl || ''} alt={user?.displayName || ''} data-ai-hint="person portrait" />
              <AvatarFallback>{getInitials(user?.displayName || teamMember?.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
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
                {userRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {userRoles.map(role => (
                            <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                        ))}
                    </div>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
             <DropdownMenuItem asChild>
                <Link href="/settings">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings')}</span>
                </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
           <DropdownMenuGroup>
            <DropdownMenuItem>
                <ThemeToggle />
            </DropdownMenuItem>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Languages className="mr-2 h-4 w-4" />
                    <span>{t('language')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setLocale('en')}>English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocale('th')}>ไทย</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
                </DropdownMenuSub>
           </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('logOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
