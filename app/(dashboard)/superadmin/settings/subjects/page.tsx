"use client";

import { BookOpen, Plus, MoreVertical, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSystemConfig, useCreateSubject, useUpdateSubject, useDeleteSubject } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SubjectFormDialog } from "@/components/dialogs/SubjectFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { Subject } from "@/lib/types";

export default function SubjectsSettingsPage() {
  const { data: config, isLoading } = useSystemConfig();
  const [search, setSearch] = useState("");

  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const filteredSubjects = config?.subjects.filter((s: any) => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditingSubject(null);
    setFormOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingSubject) {
      await updateSubject.mutateAsync({ id: editingSubject.id, ...data });
    } else {
      await createSubject.mutateAsync(data);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteSubject.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects Library"
        subtitle="Manage the global curriculum and subject codes."
        icon={BookOpen}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Filter by name or code..." 
          className="pl-9" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects?.map((subject: any) => (
          <Card key={subject.id} className="hover:border-primary/30 transition-all">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">{subject.code || "N/A"}</Badge>
              </div>
              <h4 className="font-semibold text-base mb-1">{subject.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                {subject.description || "No description provided for this subject."}
              </p>
              <div className="mt-4 pt-4 border-t border-border/30 flex justify-between items-center">
                 <span className={`text-[10px] font-bold uppercase ${subject.is_active ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    {subject.is_active ? '● Active' : '● Inactive'}
                 </span>
                 <div className="flex gap-1">
                   <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(subject)}>
                     <Pencil className="w-3.5 h-3.5" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(subject)}>
                     <Trash2 className="w-3.5 h-3.5" />
                   </Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SubjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subject={editingSubject}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Subject"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete Subject"
        onConfirm={handleDelete}
      />
    </div>
  );
}
