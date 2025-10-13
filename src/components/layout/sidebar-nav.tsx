"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListMusic,
  Calendar,
  Users,
  HeartHandshake,
  Cog,
  Music,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/songs", label: "Songs", icon: ListMusic },
  { href: "/services", label: "Services", icon: Calendar },
  { href: "/team", label: "Team", icon: Users },
  { href: "/accountability", label: "Accountability", icon: HeartHandshake },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
            <Music className="h-6 w-6 text-primary" />
            <span className="">Prasiri</span>
            </Link>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 text-sm font-medium lg:px-4">
            <div className="flex flex-col gap-2 py-4">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                    <Link
                        href={item.href}
                        className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        isActive && "bg-muted text-primary"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        <span className="truncate">{item.label}</span>
                    </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
                );
            })}
            </div>
        </nav>
        <div className="mt-auto flex flex-col gap-2 p-2 lg:p-4">
            <Tooltip>
            <TooltipTrigger asChild>
                <Link
                href="/settings"
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === "/settings" && "bg-muted text-primary"
                )}
                >
                <Cog className="h-4 w-4" />
                <span className="truncate">Settings</span>
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
        </div>
    </div>
  );
}
