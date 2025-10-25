"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListMusic,
  Calendar,
  Users,
  HeartHandshake,
  Music,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { TeamMember } from "@/lib/placeholder-data";


export const navItems = [
  { href: "/", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/songs", labelKey: "songs", icon: ListMusic },
  { href: "/services", labelKey: "services", icon: Calendar },
  { href: "/team", labelKey: "team", icon: Users },
  { href: "/accountability", labelKey: "accountability", icon: HeartHandshake },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user } = useUser();
  const firestore = useFirestore();

  const teamMemberRef = useMemoFirebase(() => user ? doc(firestore, 'team_members', user.uid) : null, [firestore, user]);
  const { data: teamMember } = useDoc<TeamMember>(teamMemberRef);
  
  const isAdmin = Array.isArray(teamMember?.role) && teamMember.role.includes('Admin');

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const label = t(item.labelKey as any);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            isActive && "bg-muted text-primary"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    </div>
  );
}
