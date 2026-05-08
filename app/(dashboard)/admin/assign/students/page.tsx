"use client";

import { useState } from "react";
import { Shield, Search, Users, ArrowRight, UserPlus, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useStudents,
  useBatches,
  useEnrollStudentInBatch,
  useUnassignedStudents,
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

export default function AdminAssignStudentsPage() {
  const { data: allStudents, isLoading: studentsLoading } = useStudents();
  const { data: unassigned, isLoading: unassignedLoading } = useUnassignedStudents();
  const { data: batches } = useBatches();
  const enrollMutation = useEnrollStudentInBatch();

  const [search, setSearch] = useState("");
  const [filterBatch, setFilterBatch] = useState("all");
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [selectedBatch, setSelectedBatch] = useState("");

  if (studentsLoading || unassignedLoading) return <LoadingSkeleton variant="dashboard" />;

  const handleAssign = async () => {
    if (!assignTarget || !selectedBatch) return;
    await enrollMutation.mutateAsync({
      student_id: assignTarget.profile_id || assignTarget.profile?.id,
      batch_id: selectedBatch,
    });
    setAssignTarget(null);
    setSelectedBatch("");
  };

  // Filter students
  const displayStudents = filterBatch === "unassigned"
    ? unassigned
    : filterBatch === "all"
      ? allStudents
      : allStudents?.filter((s: any) => s.current_batch_id === filterBatch);

  const filteredStudents = displayStudents?.filter((s: any) => {
    const name = s.profile?.full_name || "";
    const email = s.profile?.email || "";
    return name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
  });

  // Batch stats
  const batchCounts = new Map<string, number>();
  allStudents?.forEach((s: any) => {
    if (s.current_batch_id) {
      batchCounts.set(s.current_batch_id, (batchCounts.get(s.current_batch_id) || 0) + 1);
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Students"
        subtitle="Assign students to batches. Students will only see data from their assigned batch."
        icon={Shield}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Users className="w-5 h-5 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-bold">{allStudents?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><UserPlus className="w-5 h-5 text-amber-500" /></div>
            <div>
              <p className="text-2xl font-bold">{unassigned?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Unassigned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><BookOpen className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <p className="text-2xl font-bold">{batchCounts.size}</p>
              <p className="text-xs text-muted-foreground">Batches with Students</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterBatch} onValueChange={(v) => setFilterBatch(v as string)}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Filter by batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="unassigned">⚠ Unassigned Only</SelectItem>
            {batches?.map((b: any) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name} ({batchCounts.get(b.id) || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-accent/30">
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student</th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Batch</th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Level</th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents && filteredStudents.length > 0 ? (
                  filteredStudents.map((s: any) => (
                    <tr key={s.id || s.profile_id} className="border-b border-border/30 hover:bg-accent/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {s.profile?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{s.profile?.full_name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{s.profile?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {s.current_batch?.name ? (
                          <Badge variant="outline" className="text-xs bg-blue-500/5 text-blue-600 border-blue-500/20">
                            {s.current_batch.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-amber-500/5 text-amber-600 border-amber-500/20">
                            Unassigned
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {s.current_level?.name || s.current_batch?.level?.name || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className={`text-[10px] capitalize ${s.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-zinc-500/10 text-zinc-500"}`}>
                          {s.status || "active"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => { setAssignTarget(s); setSelectedBatch(s.current_batch_id || ""); }}
                        >
                          <ArrowRight className="w-3 h-3" />
                          {s.current_batch_id ? "Reassign" : "Assign"}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-muted-foreground">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={!!assignTarget} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {assignTarget?.current_batch_id ? "Reassign" : "Assign"} Student to Batch
            </DialogTitle>
            <DialogDescription>
              {assignTarget?.profile?.full_name} will only see data from the assigned batch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-accent/30 border border-border/50">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Student</p>
              <p className="text-sm font-semibold">{assignTarget?.profile?.full_name}</p>
              <p className="text-xs text-muted-foreground">{assignTarget?.profile?.email}</p>
            </div>
            <div className="space-y-2">
              <Label>Target Batch</Label>
              <Select value={selectedBatch} onValueChange={(v) => setSelectedBatch(v as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches?.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} — {b.enrolled_count}/{b.capacity} students
                      {b.level?.name ? ` (${b.level.name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={enrollMutation.isPending || !selectedBatch}>
              {enrollMutation.isPending ? "Assigning..." : "Assign to Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
