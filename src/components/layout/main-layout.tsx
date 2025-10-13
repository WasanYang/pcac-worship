"use client";

import * as React from "react";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const isSidebarOpen = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith("sidebar_state="));
      return cookie ? cookie.split('=')[1] === 'true' : true;
    }
    return true;
  }, []);

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar side="left" collapsible="icon" className="hidden sm:flex">
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-col sm:pl-14">
            <SidebarInset>
                <Header />
                <main className={cn(
                  "flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8",
                  isClient && isMobile ? "pb-24" : "pb-4"
                )}>
                    {children}
                </main>
            </SidebarInset>
        </div>
        {isClient && isMobile && (
          <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-background/95 backdrop-blur-sm">
              <div className="grid h-16 grid-cols-5 items-center justify-center gap-4 px-4">
                <div className="col-start-1">
                  <SidebarTrigger />
                </div>
              </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
