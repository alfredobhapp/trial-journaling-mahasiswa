import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpenCheck, ClipboardList, History, LayoutDashboard, ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole } from "@/lib/role-context";

const studentItems = [
  { title: "Home / Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Fill Journal", url: "/journal/new", icon: ClipboardList },
  { title: "Journal History", url: "/journal/history", icon: History },
];

const reviewerItems = [
  { title: "Home / Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Reviewer Area", url: "/reviewer", icon: ShieldCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role } = useRole();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  const items = role === "mahasiswa" ? studentItems : reviewerItems;
  const groupLabel =
    role === "mahasiswa"
      ? "Mahasiswa"
      : role === "dosen"
        ? "Dosen"
        : role === "konselor"
          ? "Konselor"
          : "Admin";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-sidebar-foreground">
                Jurnal Mahasiswa
              </div>
              <div className="truncate text-xs text-muted-foreground">
                Early Warning System
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
