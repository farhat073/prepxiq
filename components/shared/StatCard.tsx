"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  DollarSign,
  CalendarCheck,
  Building2,
  FileText,
  BookOpen,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  students: GraduationCap,
  dollar: DollarSign,
  attendance: CalendarCheck,
  branch: Building2,
  exam: FileText,
  batch: BookOpen,
  clipboard: ClipboardList,
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "up" | "down";
  icon?: string;
  color?: string;
  loading?: boolean;
  prefix?: string;
  suffix?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon = "users",
  color = "blue",
  loading = false,
  prefix = "",
  suffix = "",
}: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    );
  }

  const Icon = iconMap[icon] || Users;

  const colorClasses: Record<string, { bg: string; icon: string; shadow: string }> = {
    blue: {
      bg: "bg-blue-500/10",
      icon: "text-blue-500",
      shadow: "shadow-blue-500/10",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      icon: "text-emerald-500",
      shadow: "shadow-emerald-500/10",
    },
    amber: {
      bg: "bg-amber-500/10",
      icon: "text-amber-500",
      shadow: "shadow-amber-500/10",
    },
    rose: {
      bg: "bg-rose-500/10",
      icon: "text-rose-500",
      shadow: "shadow-rose-500/10",
    },
    purple: {
      bg: "bg-purple-500/10",
      icon: "text-purple-500",
      shadow: "shadow-purple-500/10",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-border/50 bg-card p-5 hover:shadow-lg transition-shadow duration-300",
        colors.shadow
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-2xl font-bold tracking-tight font-mono">
            {prefix}
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {(changeType || (change >= 0 ? "up" : "down")) === "up" ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  (changeType || (change >= 0 ? "up" : "down")) === "up"
                    ? "text-emerald-500"
                    : "text-rose-500"
                )}
              >
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            colors.bg
          )}
        >
          <Icon className={cn("w-5 h-5", colors.icon)} />
        </div>
      </div>
    </motion.div>
  );
}
