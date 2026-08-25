import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpenCheck, ClipboardList, History, LayoutDashboard, ShieldCheck, UserPlus, Link as LinkIcon } from "lucide-react";
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
import { useAuth } from "@/lib/auth-context";

const studentItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Fill Journal", url: "/journal/new", icon: ClipboardList },
  { title: "Journal History", url: "/journal/history", icon: History },
];

const reviewerItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Reviewer Area", url: "/reviewer", icon: ShieldCheck },
];

const adminItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Registrasi Pengguna", url: "/register", icon: UserPlus },
  { title: "Mapping Dosen-Mhs", url: "/mapping", icon: LinkIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (p: string) => (p === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(p));

  const role = user?.role || "mahasiswa";
  const items =
    role === "admin"
      ? adminItems
      : role === "mahasiswa"
        ? studentItems
        : reviewerItems;

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
