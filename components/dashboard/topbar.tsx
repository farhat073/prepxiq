"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Moon,
  Sun,
  Search,
  LogOut,
  Settings,
  User,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,

  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@/lib/constants";

// Generate breadcrumbs from pathname
function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { label, href, isLast: index === segments.length - 1 };
  });
}

export function Topbar() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { profile, unreadNotificationCount, setProfile } = useAppStore();
  const breadcrumbs = useBreadcrumbs();

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Left: Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1 min-w-0">
            {i > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            {crumb.isLast ? (
              <span className="font-medium truncate">{crumb.label}</span>
            ) : (
              <button
                onClick={() => router.push(crumb.href)}
                className="text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {crumb.label}
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => useAppStore.getState().setGlobalSearchOpen(true)}
        >
          <Search className="w-4 h-4" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadNotificationCount > 9
                ? "9+"
                : unreadNotificationCount}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center h-9 gap-2 pl-2 pr-3 rounded-md hover:bg-accent/50 transition-colors">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-xs font-medium leading-none">
                {profile?.full_name}
              </span>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                {ROLE_LABELS[profile?.role as UserRole]}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {profile?.email}
              </p>
              <Badge variant="secondary" className="w-fit text-[10px] mt-1">
                {ROLE_LABELS[profile?.role as UserRole]}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
