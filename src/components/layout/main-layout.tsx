"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/sidebar-nav";
import { useI18n } from "@/providers/i18n-provider";
import { Menu } from "lucide-react";
import { I18nProvider } from "@/providers/i18n-provider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = React.useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const isSidebarOpen = React.useMemo(() => {
    if (typeof window !== "undefined") {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sidebar_state="));
      return cookie ? cookie.split("=")[1] === "true" : true;
    }
    return true;
  }, []);

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar side="left" collapsible="icon" className="hidden sm:flex">
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-col sm:data-[state=expanded]:pl-[16rem] sm:data-[state=collapsed]:pl-[3rem] transition-all duration-200">
          <SidebarInset>
            <Header />
            <main
              className={cn(
                "flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8",
                isClient && isMobile ? "pb-24" : "pb-4"
              )}
            >
              {children}
            </main>
          </SidebarInset>
        </div>
        {isClient && isMobile && (
          <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-background/95 backdrop-blur-sm">
            <div className="grid h-16 grid-cols-4 items-center justify-items-center gap-4 px-4">
              {navItems.slice(0, 4).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 text-muted-foreground",
                      isActive && "text-primary"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[11px] font-medium">{t(item.labelKey as any)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
