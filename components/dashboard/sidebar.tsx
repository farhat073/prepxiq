"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileText,
  DollarSign,
  Megaphone,
  Calendar,
  FolderOpen,
  BarChart3,
  Settings,
  Shield,
  Building2,
  ClipboardList,
  UserCheck,
  BookMarked,
  Trophy,
  Bell,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { UserRole } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: { title: string; href: string }[];
}

const navConfig: Record<UserRole, NavItem[]> = {
  superadmin: [
    { title: "Dashboard", href: "/superadmin", icon: Home },
    {
      title: "User Management",
      href: "/superadmin/users",
      icon: Users,
      children: [
        { title: "All Users", href: "/superadmin/users" },
        { title: "Admins", href: "/superadmin/users?role=admin" },
        { title: "Teachers", href: "/superadmin/users?role=teacher" },
        { title: "Students", href: "/superadmin/users?role=student" },
      ],
    },
    { title: "Branches", href: "/superadmin/branches", icon: Building2 },
    {
      title: "System Settings",
      href: "/superadmin/settings",
      icon: Settings,
      children: [
        { title: "Academic Years", href: "/superadmin/settings/academic-years" },
        { title: "Subjects", href: "/superadmin/settings/subjects" },
        { title: "Levels", href: "/superadmin/settings/levels" },
        { title: "Grade Config", href: "/superadmin/settings/grades" },
      ],
    },
    { title: "Audit Logs", href: "/superadmin/audit-logs", icon: ClipboardList },
    { title: "Global Reports", href: "/superadmin/reports", icon: BarChart3 },
  ],
  admin: [
    { title: "Dashboard", href: "/admin", icon: Home },
    {
      title: "Students",
      href: "/admin/students",
      icon: GraduationCap,
      children: [
        { title: "All Students", href: "/admin/students" },
        { title: "Add Student", href: "/admin/students/new" },
        { title: "Admissions", href: "/admin/admissions" },
      ],
    },
    { title: "Teachers", href: "/admin/teachers", icon: UserCheck },
    { title: "Batches & Levels", href: "/admin/batches", icon: BookOpen },
    {
      title: "Attendance",
      href: "/admin/attendance",
      icon: CalendarCheck,
      children: [
        { title: "Mark Attendance", href: "/admin/attendance/mark" },
        { title: "Reports", href: "/admin/attendance" },
      ],
    },
    {
      title: "Exams & Scores",
      href: "/admin/exams",
      icon: FileText,
      children: [
        { title: "All Exams", href: "/admin/exams" },
        { title: "Create Exam", href: "/admin/exams/new" },
        { title: "Score Entry", href: "/admin/exams/scores" },
      ],
    },
    {
      title: "Fees",
      href: "/admin/fees",
      icon: DollarSign,
      children: [
        { title: "Fee Overview", href: "/admin/fees" },
        { title: "Collect Fee", href: "/admin/fees/collect" },
        { title: "Reports", href: "/admin/fees/reports" },
      ],
    },
    { title: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { title: "Timetable", href: "/admin/timetable", icon: Calendar },
    { title: "Study Materials", href: "/admin/materials", icon: FolderOpen },
    { title: "Reports", href: "/admin/reports", icon: BarChart3 },
  ],
  teacher: [
    { title: "My Dashboard", href: "/teacher", icon: Home },
    { title: "My Batches", href: "/teacher/my-batches", icon: BookOpen },
    { title: "My Students", href: "/teacher/students", icon: Users },
    { title: "Mark Attendance", href: "/teacher/attendance", icon: CalendarCheck },
    {
      title: "Exams & Scores",
      href: "/teacher/scores",
      icon: FileText,
      children: [
        { title: "My Exams", href: "/teacher/scores" },
        { title: "Enter Scores", href: "/teacher/scores/enter" },
      ],
    },
    { title: "Study Materials", href: "/teacher/materials", icon: FolderOpen },
    { title: "Homework", href: "/teacher/homework", icon: BookMarked },
    { title: "Announcements", href: "/teacher/announcements", icon: Megaphone },
  ],
  student: [
    { title: "My Dashboard", href: "/student", icon: Home },
    { title: "My Performance", href: "/student/scores", icon: Trophy },
    { title: "My Attendance", href: "/student/attendance", icon: CalendarCheck },
    { title: "Timetable", href: "/student/timetable", icon: Calendar },
    { title: "Exam Results", href: "/student/exams", icon: FileText },
    { title: "Study Materials", href: "/student/materials", icon: FolderOpen },
    { title: "Homework", href: "/student/homework", icon: BookMarked },
    { title: "Notices", href: "/student/notices", icon: Bell },
  ],
};

interface SidebarProps {
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { profile, sidebarCollapsed, toggleSidebar } = useAppStore();
  const role = profile?.role as UserRole;
  const items = navConfig[role] || [];

  if (mobile) {
    // Mobile bottom nav: show only top-level items (max 5)
    const mobileItems = items.slice(0, 5);
    return (
      <div className="flex items-center justify-around py-2 px-1">
        {mobileItems.map((item) => {
          const isActive =
            item.href === `/${role}`
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate max-w-[56px]">
                {item.title.replace("My ", "")}
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-border/50 shrink-0",
          sidebarCollapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-w-0"
          >
            <h1 className="text-sm font-bold tracking-tight truncate">
              PREPX <span className="text-blue-500">IQ</span>
            </h1>
            <p className="text-[10px] text-muted-foreground truncate">
              ERP Platform
            </p>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {items.map((item) => {
          const isActive =
            item.href === `/${role}`
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== `/${role}`;
          const Icon = item.icon;

          if (sidebarCollapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center w-full h-10 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 h-10 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary/10 text-primary font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm truncate">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] font-medium bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>

              {/* Sub-items */}
              {item.children && isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-8 mt-1 space-y-0.5 overflow-hidden"
                >
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center px-3 h-8 rounded-md text-sm transition-colors",
                          isChildActive
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {child.title}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 py-3 border-t border-border/50">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
