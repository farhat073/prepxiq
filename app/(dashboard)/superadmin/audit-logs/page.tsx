"use client";

import { ClipboardList, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { useAuditLogs } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useAuditLogs();

  const columns = [
    {
      header: "Timestamp",
      accessorKey: "created_at",
      cell: ({ row }: any) => (
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(row.original.created_at).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      ),
    },
    {
      header: "User",
      accessorKey: "user.full_name",
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.user?.full_name || "System"}</span>
          <span className="text-[10px] text-muted-foreground capitalize">{row.original.user?.role}</span>
        </div>
      ),
    },
    {
      header: "Action",
      accessorKey: "action",
      cell: ({ row }: any) => (
        <Badge 
          variant="outline" 
          className={`capitalize text-[10px] px-1.5 py-0 h-5 font-medium ${
            row.original.action === "created" ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/5" :
            row.original.action === "updated" ? "border-blue-500/50 text-blue-500 bg-blue-500/5" :
            row.original.action === "deleted" ? "border-rose-500/50 text-rose-500 bg-rose-500/5" :
            "border-muted text-muted-foreground"
          }`}
        >
          {row.original.action}
        </Badge>
      ),
    },
    {
      header: "Resource",
      accessorKey: "resource",
      cell: ({ row }: any) => (
        <span className="capitalize font-medium">{row.original.resource}</span>
      ),
    },
    {
      header: "IP Address",
      accessorKey: "ip_address",
      cell: ({ row }: any) => (
        <span className="text-[10px] font-mono text-muted-foreground">{row.original.ip_address || "—"}</span>
      ),
    },
  ];

  if (isLoading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all system activities and user actions across the institution."
        icon={ClipboardList}
      />

      <DataTable
        columns={columns}
        data={logs || []}
        searchPlaceholder="Filter logs by user or resource..."
      />
    </div>
  );
}
