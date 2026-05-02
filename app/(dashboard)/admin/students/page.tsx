"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Eye, Trash2, Phone, Loader2 } from "lucide-react";

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
import { useProfiles, useDeleteProfile } from "@/lib/supabase/hooks";
import type { Profile } from "@/lib/types";

export default function StudentsPage() {
  const { data: students, isLoading } = useProfiles("student");
  const deleteProfile = useDeleteProfile();
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);

  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: "full_name",
      header: "Student Name",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-primary">
                {student.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
              </span>
            </div>
            <div>
              <p className="font-medium">{student.full_name}</p>
              <p className="text-xs text-muted-foreground">{student.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string;
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
      cell: ({ row }) => <span className="capitalize">{row.getValue("gender") || "N/A"}</span>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
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
        const student = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href={`/admin/students/${student.id}`} className="flex items-center cursor-pointer w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <Pencil className="w-4 h-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                onClick={() => setDeleteTarget(student)}
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
          <Link href="/admin/students/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </Link>
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
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteProfile.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
