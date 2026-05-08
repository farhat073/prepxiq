"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, Search, Users, Clock, Layers, MoreVertical, Pencil, Trash2, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useBatches, useLevels, useCreateBatch, useUpdateBatch, useDeleteBatch } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BatchFormDialog } from "@/components/dialogs/BatchFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { Batch } from "@/lib/types";

export default function AdminBatchesPage() {
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const { data: levels, isLoading: levelsLoading } = useLevels();
  const [search, setSearch] = useState("");

  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();
  const deleteBatch = useDeleteBatch();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null);

  if (batchesLoading || levelsLoading) return <LoadingSkeleton variant="dashboard" />;

  const filteredBatches = batches?.filter((b: any) => 
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditingBatch(null);
    setFormOpen(true);
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingBatch) {
      await updateBatch.mutateAsync({ id: editingBatch.id, ...data });
    } else {
      await createBatch.mutateAsync(data);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteBatch.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batches & Levels"
        subtitle="Organize students into groups and manage academic hierarchies."
        icon={BookOpen}
        actions={
          <div className="flex gap-2">
            <Link href="/admin/batches/promote">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <GraduationCap className="w-4 h-4 mr-2 text-emerald-600" />
                Promote Students
              </Button>
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New Batch
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="batches" className="w-full">
        <TabsList className="bg-accent/20">
          <TabsTrigger value="batches" className="gap-2">
            <Users className="w-4 h-4" /> Batches
          </TabsTrigger>
          <TabsTrigger value="levels" className="gap-2">
            <Layers className="w-4 h-4" /> Levels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="mt-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBatches && filteredBatches.length > 0 ? (
              filteredBatches.map((batch: any) => (
                <Card key={batch.id} className="hover:border-primary/30 transition-all group">
                  <CardHeader className="pb-3 border-b border-border/50 bg-accent/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{batch.name}</h3>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5">{batch.code}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(batch)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit Batch
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(batch)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Students</p>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-sm font-semibold">{batch.enrolled_count} / {batch.capacity}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Schedule</p>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-sm font-semibold">{batch.start_time?.slice(0, 5) || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                       <Badge variant="secondary" className="text-[10px] bg-primary/5 text-primary border-primary/10">
                          {batch.level?.name || "No Level"}
                       </Badge>
                       <span className={`text-[10px] font-bold uppercase ${batch.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {batch.is_active ? '● Active' : '● Inactive'}
                       </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border border-dashed rounded-xl bg-accent/5">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No Batches Found</h3>
                <p className="text-muted-foreground">Create your first batch to start enrolling students.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="levels" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {levels?.map((level: any) => (
              <Card key={level.id} className="bg-accent/5 border-border/50">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {level.order_index}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{level.name}</h4>
                      <p className="text-xs text-muted-foreground">{level.description || "No description"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Pass Criteria</p>
                    <p className="text-sm font-bold text-emerald-600">{level.min_score_to_promote}%</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <BatchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        batch={editingBatch}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Batch"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Batch"
        onConfirm={handleDelete}
      />
    </div>
  );
}
