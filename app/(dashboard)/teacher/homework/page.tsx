"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, BookOpen, Users, FileText, Eye, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useHomework, useCreateHomework, useTeacherAssignments } from "@/lib/supabase/hooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function TeacherHomeworkPage() {
  const profile = useAppStore((s) => s.profile);
  const { data: homework, isLoading } = useHomework();
  const { data: assignments, isLoading: assignmentsLoading } = useTeacherAssignments(profile?.id || "");
  const createHomework = useCreateHomework();

  const assignmentOptions = useMemo(() => {
    if (!assignments) return [];
    return assignments.map((a: any) => ({
      id: a.id,
      batch_id: a.batch_id,
      batch_name: a.batch?.name || "Unknown",
      subject_id: a.subject_id,
      subject_name: a.subject?.name || "Unknown",
    }));
  }, [assignments]);

  // Auto-select if only one assignment
  const [selectedAssignment, setSelectedAssignment] = useState("");
  useEffect(() => {
    if (assignmentOptions.length === 1 && !selectedAssignment) {
      setSelectedAssignment(assignmentOptions[0].id);
    }
  }, [assignmentOptions, selectedAssignment]);

  const currentAssignment = assignmentOptions.find((a: any) => a.id === selectedAssignment);

  // Filter homework to assigned batches only
  const assignedBatchIds = useMemo(() => {
    if (!assignments) return [];
    return [...new Set(assignments.map((a: any) => a.batch_id))];
  }, [assignments]);

  const scopedHomework = useMemo(() => {
    if (!homework || assignedBatchIds.length === 0) return [];
    return homework.filter((hw: any) => assignedBatchIds.includes(hw.batch_id));
  }, [homework, assignedBatchIds]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    max_marks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !currentAssignment) return;

    await createHomework.mutateAsync({
      ...formData,
      batch_id: currentAssignment.batch_id,
      subject_id: currentAssignment.subject_id,
      assigned_by: profile.id,
      max_marks: parseFloat(formData.max_marks) || 0,
    });
    setIsDialogOpen(false);
    setFormData({ title: "", description: "", due_date: "", max_marks: "" });
  };

  if (isLoading || assignmentsLoading) return <LoadingSkeleton />;

  // No assignments
  if (!assignments || assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Shield className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold">No Assignments Yet</h2>
        <p className="text-muted-foreground max-w-sm">
          You haven&apos;t been assigned to any batches yet. Homework can only be created for assigned batches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Homework Assignments" 
          subtitle="Manage and track homework for your assigned batches."
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Assign Homework
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign New Homework</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  required 
                />
              </div>

              {/* Assignment selector — replaces manual batch + subject */}
              <div className="grid gap-2">
                <Label>Batch / Subject</Label>
                {assignmentOptions.length === 1 ? (
                  <div className="p-2 rounded-md bg-accent/50 text-sm font-medium border">
                    {assignmentOptions[0].batch_name} — {assignmentOptions[0].subject_name}
                  </div>
                ) : (
                  <Select 
                    value={selectedAssignment} 
                    onValueChange={(v) => setSelectedAssignment(v as string)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignmentOptions.map((a: any) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.batch_name} — {a.subject_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input 
                    id="due_date" 
                    type="date" 
                    value={formData.due_date} 
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_marks">Max Marks</Label>
                  <Input 
                    id="max_marks" 
                    type="number" 
                    value={formData.max_marks} 
                    onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description / Instructions</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createHomework.isPending || !selectedAssignment}>
                {createHomework.isPending ? "Assigning..." : "Create Assignment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scopedHomework?.map((hw: any) => {
          // Find matching assignment for batch name display
          const matchingAssignment = assignmentOptions.find((a: any) => a.batch_id === hw.batch_id && a.subject_id === hw.subject_id);
          return (
            <motion.div
              key={hw.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {hw.subject?.name || matchingAssignment?.subject_name}
                    </Badge>
                    <Badge variant={new Date(hw.due_date) < new Date() ? "destructive" : "secondary"} className="text-[10px]">
                      Due {format(new Date(hw.due_date), "MMM d, yyyy")}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2 line-clamp-1">{hw.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                    {hw.description || "No description provided."}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{matchingAssignment?.batch_name || "Batch"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Max Marks: {hw.max_marks}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={`/teacher/homework/${hw.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-2">
                        <Eye className="w-3.5 h-3.5" />
                        View Submissions
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {scopedHomework?.length === 0 && (
          <div className="col-span-full py-20 text-center border rounded-xl bg-muted/20">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No homework assigned yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              Click the &quot;Assign Homework&quot; button to create your first assignment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
