"use client";

import { useState } from "react";
import { Layers, Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSystemConfig, useCreateLevel, useUpdateLevel, useDeleteLevel } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LevelFormDialog } from "@/components/dialogs/LevelFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { Level } from "@/lib/types";

export default function LevelsSettingsPage() {
  const { data: config, isLoading } = useSystemConfig();

  const createLevel = useCreateLevel();
  const updateLevel = useUpdateLevel();
  const deleteLevel = useDeleteLevel();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Level | null>(null);

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const handleCreate = () => {
    setEditingLevel(null);
    setFormOpen(true);
  };

  const handleEdit = (level: Level) => {
    setEditingLevel(level);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingLevel) {
      await updateLevel.mutateAsync({ id: editingLevel.id, ...data });
    } else {
      await createLevel.mutateAsync(data);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteLevel.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Levels"
        subtitle="Define the educational hierarchy and promotion stages."
        icon={Layers}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Level
          </Button>
        }
      />

      <div className="space-y-4">
        {config?.levels.map((level: any) => (
          <Card key={level.id} className="hover:border-primary/30 transition-all overflow-hidden">
            <CardContent className="p-0 flex">
              <div className="w-16 bg-primary/10 flex items-center justify-center text-primary font-black text-xl border-r border-border/50">
                {level.order_index}
              </div>
              <div className="flex-1 p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-base">{level.name}</h4>
                  <p className="text-sm text-muted-foreground">{level.description || "Standard academic progression level."}</p>
                </div>
                <div className="flex items-center gap-8">
                   <div className="text-right">
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Min. Promo Score</p>
                     <p className="text-lg font-bold text-emerald-600">{level.min_score_to_promote}%</p>
                   </div>
                   <div className="flex gap-2 border-l border-border/50 pl-6">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(level)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteTarget(level)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <LevelFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        level={editingLevel}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Level"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete Level"
        onConfirm={handleDelete}
      />
    </div>
  );
}
