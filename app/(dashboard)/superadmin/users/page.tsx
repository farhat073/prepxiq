"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Eye, Trash2, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { UserFormDialog, ViewUserDialog, EditUserDialog } from "@/components/dialogs/UserFormDialog";
import { useProfiles } from "@/lib/supabase/hooks";
import type { Profile } from "@/lib/types";

const roleColors: Record<string, string> = {
  superadmin: "bg-purple-500/15 text-purple-500 border-purple-500/20",
  admin: "bg-blue-500/15 text-blue-500 border-blue-500/20",
  teacher: "bg-amber-500/15 text-amber-500 border-amber-500/20",
  student: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
};

export default function UsersPage() {
  const searchParams = useSearchParams();
  const roleFilter = searchParams.get("role") || undefined;

  const { data: users, isLoading, refetch } = useProfiles(roleFilter);

  // Dialog states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<Profile | null>(null);
  const [editTarget, setEditTarget] = useState<Profile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);

  const title = roleFilter
    ? `${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}s`
    : "All Users";

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/users?id=${deleteTarget.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success("User deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error("Failed to delete user", { description: err.message });
    }
    setDeleteTarget(null);
  };

  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {p.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
              </span>
            </div>
            <div>
              <p className="font-medium">{p.full_name}</p>
              <p className="text-xs text-muted-foreground">{p.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return <Badge variant="outline" className={roleColors[role] || ""}>{role}</Badge>;
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const active = row.getValue("is_active") as boolean;
        return (
          <Badge variant={active ? "default" : "secondary"}
            className={active ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20" : ""}
          >
            {active ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={() => setViewTarget(user)}>
                <Eye className="w-4 h-4 mr-2" /> View
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setEditTarget(user)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setDeleteTarget(user)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={`Manage all platform users across branches. ${users?.length || 0} total.`}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setAddUserOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Button>
        }
      />
      <DataTable columns={columns} data={users || []} searchKey="full_name" searchPlaceholder="Search users..." />

      {/* Add User */}
      <UserFormDialog open={addUserOpen} onOpenChange={setAddUserOpen} onSuccess={() => refetch()} />

      {/* View User */}
      <ViewUserDialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)} user={viewTarget} />

      {/* Edit User */}
      <EditUserDialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)} user={editTarget} onSuccess={() => refetch()} />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.full_name}"? This will permanently remove their account and profile.`}
        confirmLabel="Delete User"
        onConfirm={handleDelete}
      />
    </div>
  );
}
