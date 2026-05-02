"use client";

import { useState } from "react";
import { Plus, Building2, MapPin, Phone, Mail, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BranchFormDialog } from "@/components/dialogs/BranchFormDialog";
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from "@/lib/supabase/hooks";
import type { Branch } from "@/lib/types";

export default function BranchesPage() {
  const { data: branches, isLoading } = useBranches();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

  const handleCreate = () => {
    setEditingBranch(null);
    setFormOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingBranch) {
      await updateBranch.mutateAsync({ id: editingBranch.id, ...data });
    } else {
      await createBranch.mutateAsync(data);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteBranch.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

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
        title="Branches"
        subtitle={`Manage all PrepXIQ center locations. ${branches?.length || 0} total.`}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Branch
          </Button>
        }
      />

      {branches && branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No branches yet</h3>
          <p className="text-muted-foreground mb-4">Create your first branch to get started.</p>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Branch
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches?.map((branch) => (
            <Card key={branch.id} className="group hover:shadow-md transition-shadow border-border/50">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{branch.name}</CardTitle>
                    <Badge variant="outline" className={branch.is_active ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20 mt-1" : "mt-1"}>
                      {branch.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(branch)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteTarget(branch)} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> {branch.city || "N/A"}{branch.state ? `, ${branch.state}` : ""}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> {branch.phone || "N/A"}</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" /> {branch.email || "N/A"}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog (Add/Edit) */}
      <BranchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        branch={editingBranch}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Branch"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Branch"
        onConfirm={handleDelete}
      />
    </div>
  );
}
