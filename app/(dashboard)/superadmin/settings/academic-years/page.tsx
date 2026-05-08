"use client";

import { useState } from "react";
import { Calendar, Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSystemConfig, useCreateAcademicYear, useUpdateAcademicYear, useDeleteAcademicYear } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AcademicYearFormDialog } from "@/components/dialogs/AcademicYearFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { format } from "date-fns";
import type { AcademicYear } from "@/lib/types";

export default function AcademicYearsPage() {
  const { data: config, isLoading } = useSystemConfig();

  const createYear = useCreateAcademicYear();
  const updateYear = useUpdateAcademicYear();
  const deleteYear = useDeleteAcademicYear();

  const [formOpen, setFormOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AcademicYear | null>(null);

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const handleCreate = () => {
    setEditingYear(null);
    setFormOpen(true);
  };

  const handleEdit = (year: AcademicYear) => {
    setEditingYear(year);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingYear) {
      await updateYear.mutateAsync({ id: editingYear.id, ...data });
    } else {
      await createYear.mutateAsync(data);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteYear.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Years"
        subtitle="Configure enrollment periods and academic sessions."
        icon={Calendar}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Year
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        {config?.academicYears && config.academicYears.length > 0 ? (
          config.academicYears.map((year: any) => (
            <Card key={year.id} className="hover:border-primary/30 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base">{year.name}</h4>
                      {year.is_current && <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]">CURRENT</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(year.start_date), "PPP")} — {format(new Date(year.end_date), "PPP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(year)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteTarget(year)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed rounded-xl bg-accent/5">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No Academic Years</h3>
            <p className="text-muted-foreground mb-4">Create your first academic year to organize sessions.</p>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Academic Year
            </Button>
          </div>
        )}
      </div>

      <AcademicYearFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        academicYear={editingYear}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Academic Year"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Year"
        onConfirm={handleDelete}
      />
    </div>
  );
}
