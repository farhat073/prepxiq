"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Eye, Trash2, Phone, Loader2, Users } from "lucide-react";

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
import { useStudents, useDeleteProfile } from "@/lib/supabase/hooks";
import type { Profile } from "@/lib/types";
import type { StudentProfile } from "@/lib/types";
import { EnrollStudentDialog } from "@/components/dialogs/EnrollStudentDialog";
import { EditUserDialog } from "@/components/dialogs/UserFormDialog";
import { toast } from "sonner";

export default function StudentsPage() {
  const { data: students, isLoading, refetch } = useStudents();
  const deleteProfile = useDeleteProfile();
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Profile | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/users?id=${deleteTarget.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success("Student deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error("Failed to delete student", { description: err.message });
    }
    setDeleteTarget(null);
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "full_name",
      accessorFn: (row: any) => row.profile?.full_name || "",
      header: "Student Name",
      cell: ({ row }) => {
        const sp = row.original;
        const profile = sp.profile;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-primary">
                {profile?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
              </span>
            </div>
            <div>
              <p className="font-medium">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => {
        const phone = row.original.profile?.phone;
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{phone || "N/A"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => <span className="capitalize">{row.original.profile?.gender || "N/A"}</span>,
    },
    {
      accessorKey: "current_batch",
      header: "Batch",
      cell: ({ row }) => {
        const batchName = row.original.current_batch?.name;
        return batchName ? (
          <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">
            {batchName}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">Unassigned</Badge>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.profile?.is_active;
        return (
          <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20" : ""}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const sp = row.original;
        const profile = sp.profile;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={() => setEditTarget(profile)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                onClick={() => setDeleteTarget(profile)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Student
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
        title="Students"
        subtitle={`Manage all student enrollments, profiles, and statuses. ${students?.length || 0} total.`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEnrollDialogOpen(true)}>
              <Users className="w-4 h-4 mr-2" />
              Assign to Batch
            </Button>
            <Link href="/admin/students/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </Link>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={students || []}
        searchKey="full_name"
        searchPlaceholder="Search students by name..."
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Student"
        description={`Are you sure you want to delete "${deleteTarget?.full_name}"? This will remove their profile and all related records.`}
        confirmLabel="Delete Student"
        onConfirm={handleDelete}
      />

      <EnrollStudentDialog 
        open={enrollDialogOpen} 
        onOpenChange={setEnrollDialogOpen}
      />

      <EditUserDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        user={editTarget}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
