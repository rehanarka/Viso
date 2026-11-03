"use client";

import { Building2, Camera, Clock3, LayoutDashboard, LogOut, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { signOut } from "@/services/auth";

const presenceItems = [
  { title: "Dashboard", href: "/Employee/Dashboard", icon: LayoutDashboard },
  { title: "My Department", href: "/Employee/Department", icon: UsersRound },
  { title: "Attendance", href: "/Employee/Attendance", icon: Clock3 },
  { title: "Profile", href: "/Employee/Profile", icon: UserRound },
];

function BrandMark() {
  return (
    <Link className="flex h-14 min-w-0 items-center gap-3 rounded-xl px-2.5 text-sidebar-foreground transition-colors hover:bg-white/[0.045] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" href="/Employee/Dashboard">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-emerald-200/20 bg-[linear-gradient(135deg,#bbf7d0,#5eead4)] text-sm font-black text-zinc-950">V</span>
      <span className="min-w-0 overflow-hidden whitespace-nowrap leading-tight group-data-[collapsible=icon]:hidden">
        <span className="block text-[17px] font-black tracking-tight text-white">Viso</span>
        <span className="block text-xs font-medium text-zinc-500">Employee presence</span>
      </span>
    </Link>
  );
}

function SidebarLink({ active, href, icon: Icon, title }: { active: boolean; href: string; icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={title} className="relative h-10 justify-start rounded-xl px-3 text-zinc-400 transition-colors hover:bg-white/[0.055] hover:text-zinc-100 data-active:bg-white/[0.075] data-active:text-emerald-100 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-emerald-300 before:opacity-0 before:transition-opacity data-active:before:opacity-100 group-data-[collapsible=icon]:before:hidden">
        <Link href={href}><Icon className="size-4.5" /><span className="font-semibold">{title}</span></Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/Auth/Login");
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon" className="border-white/10 bg-[linear-gradient(180deg,#111315,#09090b)]">
          <SidebarHeader className="border-b border-white/10 px-3 py-4 group-data-[collapsible=icon]:px-2"><BrandMark /></SidebarHeader>
          <SidebarContent className="gap-4 px-3 py-4 group-data-[collapsible=icon]:px-2">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">Presence</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">{presenceItems.map((item) => <SidebarLink active={pathname === item.href} href={item.href} icon={item.icon} key={item.href} title={item.title} />)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="mx-1 my-0 bg-white/10" />
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1"><SidebarLink active={false} href="/Employee/Department" icon={Building2} title="Company team" /></SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-white/10 p-3 group-data-[collapsible=icon]:px-2">
            <div className="mb-2 rounded-xl border border-white/10 bg-white/[0.035] p-3 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-100"><ShieldCheck className="size-4 text-emerald-200" />Presence ready</div>
                <Camera className="size-4 text-zinc-500" />
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">Use camera check-in and review your own attendance records.</p>
            </div>
            <SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild tooltip="Logout" className="h-10 justify-start rounded-xl px-3 text-zinc-500 hover:bg-red-400/10 hover:text-red-200 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"><button onClick={() => void handleLogout()} type="button"><LogOut className="size-4" /><span className="font-medium">Logout</span></button></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#09090b]/86 px-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="rounded-xl border border-white/10 bg-white/[0.035] text-zinc-300 hover:bg-white/[0.07] hover:text-white" />
              <div><p className="text-sm font-semibold text-zinc-50">Employee Console</p><p className="text-xs text-muted-foreground">Face presence and personal records</p></div>
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
