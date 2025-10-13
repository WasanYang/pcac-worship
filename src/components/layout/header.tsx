import { UserNav } from "@/components/layout/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="hidden sm:flex items-center gap-2">
        <SidebarTrigger />
      </div>
      
      <div className="ml-auto">
        <UserNav />
      </div>
    </header>
  );
}
