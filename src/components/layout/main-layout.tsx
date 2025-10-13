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

  // Get sidebar state from cookie
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
        <Sidebar variant="inset" collapsible="icon">
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
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
          <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-background md:hidden">
              <div className="flex h-16 items-center justify-between px-4">
                <SidebarTrigger />
                {/* Add other footer items here if needed */}
              </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
