"use client";

import {
  BarChart3,
  Building2,
  CalendarClock,
  Clock3,
  Folders,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const mainItems = [
  { title: "Dashboard", href: "/Admin/Dashboard", icon: LayoutDashboard },
  { title: "Employees", href: "/Admin/Employees", icon: Users },
  { title: "Departments", href: "/Admin/Departments", icon: Folders },
  { title: "Attendance", href: "/Admin/Attendance", icon: Clock3 },
  { title: "Schedules", href: "/Admin/Schedules", icon: CalendarClock },
  { title: "Reports", href: "/Admin/Reports", icon: BarChart3 },
];

const workspaceItems = [
  { title: "Company", href: "/Admin/Company", icon: Building2 },
  { title: "Settings", href: "/Admin/Settings", icon: Settings },
];

function BrandMark() {
  return (
    <Link className="flex h-14 min-w-0 items-center gap-3 rounded-xl px-2 text-sidebar-foreground transition-colors hover:bg-white/[0.04] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" href="/Admin/Dashboard">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-[linear-gradient(135deg,#5eead4,#a7f3d0_48%,#fef3c7)] text-sm font-black text-zinc-950 shadow-[0_12px_35px_rgba(45,212,191,0.22)]">
        V
      </span>
      <span className="min-w-0 overflow-hidden whitespace-nowrap group-data-[collapsible=icon]:hidden">
        <span className="block text-lg font-black tracking-tight text-white">Viso</span>
        <span className="block text-[11px] font-medium text-sidebar-foreground/48">Attendance OS</span>
      </span>
    </Link>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  title,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  active: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={title}
        className="h-10 justify-start rounded-lg px-3 text-sidebar-foreground/78 data-active:bg-emerald-300/10 data-active:text-emerald-100 hover:bg-sidebar-accent/80 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
      >
        <Link href={href}>
          <Icon className="size-4" />
          <span className="font-medium">{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon" className="border-sidebar-border/70 bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.16),transparent_34%),linear-gradient(180deg,#101113,#0a0a0b)]">
          <SidebarHeader className="border-b border-sidebar-border/70 p-3 group-data-[collapsible=icon]:px-2">
            <BrandMark />
          </SidebarHeader>

          <SidebarContent className="gap-3 px-2 py-4">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/38">
                Operations
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {mainItems.map((item) => (
                    <SidebarLink
                      active={pathname === item.href}
                      href={item.href}
                      icon={item.icon}
                      key={item.href}
                      title={item.title}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="my-1 bg-white/10" />

            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/38">
                Workspace
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {workspaceItems.map((item) => (
                    <SidebarLink
                      active={pathname === item.href}
                      href={item.href}
                      icon={item.icon}
                      key={item.href}
                      title={item.title}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border/70 p-3 group-data-[collapsible=icon]:px-2">
            <div className="mb-2 rounded-xl border border-white/10 bg-white/[0.035] p-3 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-100">
                <Sparkles className="size-4 text-amber-200" />
                Shift readiness
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/10">
                <div className="h-full w-[78%] rounded-full bg-[linear-gradient(90deg,#2dd4bf,#facc15)]" />
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Logout"
                  className="h-10 justify-start rounded-xl px-3 text-sidebar-foreground/70 hover:bg-red-400/10 hover:text-red-200 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                >
                  <Link href="/Auth/Login">
                    <LogOut className="size-4" />
                    <span className="font-medium">Logout</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/82 px-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="rounded-xl border border-border bg-card/70 text-zinc-200 hover:bg-zinc-800 hover:text-white" />
              <div>
                <p className="text-sm font-semibold text-zinc-50">Admin Console</p>
                <p className="text-xs text-muted-foreground">Workforce presence control center</p>
              </div>
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
