"use client";

import { useState } from "react";
import { Shield, Plus, Trash2, Search, Users, BookOpen, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAllTeacherAssignments,
  useAssignTeacherToBatch,
  useRemoveTeacherAssignment,
  useTeachers,
  useBatches,
  useSubjects,
} from "@/lib/supabase/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export default function AdminAssignTeachersPage() {
  const { data: assignments, isLoading } = useAllTeacherAssignments();
  const { data: teachers } = useTeachers();
  const { data: batches } = useBatches();
  const { data: subjects } = useSubjects();
  const assignMutation = useAssignTeacherToBatch();
  const removeMutation = useRemoveTeacherAssignment();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form, setForm] = useState({ teacher_id: "", batch_id: "", subject_id: "" });

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const filtered = assignments?.filter((a: any) =>
    a.teacher?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.batch?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.subject?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!form.teacher_id || !form.batch_id || !form.subject_id) return;
    await assignMutation.mutateAsync(form);
    setIsDialogOpen(false);
    setForm({ teacher_id: "", batch_id: "", subject_id: "" });
  };

  const handleRemove = async () => {
    if (deleteTarget) {
      await removeMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Group assignments by teacher for a clearer view
  const byTeacher = new Map<string, any[]>();
  filtered?.forEach((a: any) => {
    const key = a.teacher_id || "unknown";
    if (!byTeacher.has(key)) byTeacher.set(key, []);
    byTeacher.get(key)!.push(a);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Teachers"
        subtitle="Assign teachers to batches and subjects. Teachers will only see their assigned batches."
        icon={Shield}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by teacher, batch, or subject..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Users className="w-5 h-5 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-bold">{byTeacher.size}</p>
              <p className="text-xs text-muted-foreground">Teachers Assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><BookOpen className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <p className="text-2xl font-bold">{filtered?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Assignments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><GraduationCap className="w-5 h-5 text-amber-500" /></div>
            <div>
              <p className="text-2xl font-bold">{new Set(filtered?.map((a: any) => a.batch_id)).size}</p>
              <p className="text-xs text-muted-foreground">Batches Covered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments grouped by teacher */}
      <div className="space-y-4">
        {Array.from(byTeacher.entries()).map(([teacherId, teacherAssignments]) => {
          const teacher = teacherAssignments[0]?.teacher;
          return (
            <Card key={teacherId} className="overflow-hidden">
              <CardHeader className="bg-accent/30 pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {teacher?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{teacher?.full_name || "Unknown"}</CardTitle>
                      <p className="text-xs text-muted-foreground">{teacher?.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {teacherAssignments.length} assignment{teacherAssignments.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="space-y-2">
                  {teacherAssignments.map((a: any) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs bg-blue-500/5 text-blue-600 border-blue-500/20">
                          {a.batch?.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">→</span>
                        <Badge variant="outline" className="text-xs bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                          {a.subject?.name}
                        </Badge>
                        {a.batch?.level?.name && (
                          <span className="text-[10px] text-muted-foreground font-medium uppercase">
                            {a.batch.level.name}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(a)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {byTeacher.size === 0 && (
          <div className="py-24 text-center border border-dashed rounded-xl bg-accent/5">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No Assignments Yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              Assign teachers to batches and subjects to get started.
            </p>
          </div>
        )}
      </div>

      {/* Create Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Teacher Assignment</DialogTitle>
            <DialogDescription>
              Assign a teacher to a specific batch and subject. The teacher will only be able to access this batch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={form.teacher_id} onValueChange={(v) => setForm({ ...form, teacher_id: v as string })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Batch</Label>
              <Select value={form.batch_id} onValueChange={(v) => setForm({ ...form, batch_id: v as string })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches?.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name} {b.level?.name ? `(${b.level.name})` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v as string })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assignMutation.isPending || !form.teacher_id || !form.batch_id || !form.subject_id}>
              {assignMutation.isPending ? "Assigning..." : "Assign Teacher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Assignment"
        description={`Remove ${deleteTarget?.teacher?.full_name} from ${deleteTarget?.batch?.name} — ${deleteTarget?.subject?.name}?`}
        confirmLabel="Remove"
        onConfirm={handleRemove}
      />
    </div>
  );
}
