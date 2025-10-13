"use client";

import * as React from "react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
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
                <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
