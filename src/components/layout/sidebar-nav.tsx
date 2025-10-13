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
import { useI18n } from "@/providers/i-18n-provider";

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

  return (
    <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
            <Music className="h-6 w-6 text-primary" />
            <span className="">{t('prasiri')}</span>
            </Link>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 text-sm font-medium lg:px-4">
            <div className="flex flex-col gap-2 py-4">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const label = t(item.labelKey as any);
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
                        <span className="truncate">{label}</span>
                    </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
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
                <span className="truncate">{t('settings')}</span>
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{t('settings')}</TooltipContent>
            </Tooltip>
        </div>
    </div>
  );
}
