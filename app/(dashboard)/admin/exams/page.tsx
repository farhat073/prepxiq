"use client";

import { useState } from "react";
import { FileText, Plus, Trophy, Calendar, BookOpen, Users, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useExams, useCreateExam, useSubjects, useBatches, useAcademicYears } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/useAppStore";

export default function AdminExamsPage() {
  const { profile } = useAppStore();
  const { data: exams, isLoading } = useExams();
  const { data: subjects } = useSubjects();
  const { data: batches } = useBatches();
  const { data: academicYears } = useAcademicYears();
  const createExamMutation = useCreateExam();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "exam",
    subject_id: "",
    batch_id: "",
    academic_year_id: "",
    exam_date: "",
    total_marks: "",
    passing_marks: "",
    duration_minutes: "",
    instructions: "",
  });

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExamMutation.mutateAsync({
        ...formData,
        total_marks: parseFloat(formData.total_marks),
        passing_marks: parseFloat(formData.passing_marks),
        duration_minutes: parseInt(formData.duration_minutes),
        created_by: profile?.id,
      });
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        type: "exam",
        subject_id: "",
        batch_id: "",
        academic_year_id: "",
        exam_date: "",
        total_marks: "",
        passing_marks: "",
        duration_minutes: "",
        instructions: "",
      });
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations"
        subtitle="Schedule tests, manage marking schemes, and track results."
        icon={FileText}
        actions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow hover:bg-blue-700 h-9 px-4 py-2">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Exam
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreateExam}>
                <DialogHeader>
                  <DialogTitle>Schedule New Examination</DialogTitle>
                  <DialogDescription>Fill in the details to create a new exam for a specific batch.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Exam Title</Label>
                    <Input id="title" placeholder="e.g. Mid-Term Physics 2024" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as string})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exam">Major Exam</SelectItem>
                        <SelectItem value="mock_test">Mock Test</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="class_test">Class Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select value={formData.academic_year_id} onValueChange={(v) => setFormData({...formData, academic_year_id: v as string})}>
                      <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                      <SelectContent>
                        {academicYears?.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Batch</Label>
                    <Select value={formData.batch_id} onValueChange={(v) => setFormData({...formData, batch_id: v as string})}>
                      <SelectTrigger><SelectValue placeholder="Select Batch" /></SelectTrigger>
                      <SelectContent>
                        {batches?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={formData.subject_id} onValueChange={(v) => setFormData({...formData, subject_id: v as string})}>
                      <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                      <SelectContent>
                        {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Date</Label>
                    <Input type="date" value={formData.exam_date} onChange={(e) => setFormData({...formData, exam_date: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (Minutes)</Label>
                    <Input type="number" placeholder="180" value={formData.duration_minutes} onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Marks</Label>
                    <Input type="number" placeholder="100" value={formData.total_marks} onChange={(e) => setFormData({...formData, total_marks: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Passing Marks</Label>
                    <Input type="number" placeholder="35" value={formData.passing_marks} onChange={(e) => setFormData({...formData, passing_marks: e.target.value})} required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Instructions (Optional)</Label>
                    <Textarea placeholder="Specific rules or topics covered..." value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createExamMutation.isPending}>
                    {createExamMutation.isPending ? "Creating..." : "Schedule Exam"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams && exams.length > 0 ? (
          exams.map((exam: any) => (
            <div key={exam.id} className="rounded-xl border border-border/50 bg-card p-5 hover:border-primary/50 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={exam.is_published ? "default" : "secondary"} className="capitalize">
                    {exam.is_published ? "Published" : "Draft"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/admin/exams/scores?examId=${exam.id}`}>
                        <DropdownMenuItem className="cursor-pointer">
                          <Trophy className="w-4 h-4 mr-2" />
                          Enter Scores
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Exam
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{exam.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {exam.subject?.name} • {exam.batch?.name}
              </p>

              <div className="grid grid-cols-2 gap-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{exam.exam_date ? format(new Date(exam.exam_date), "MMM d, yyyy") : "No date"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{exam.total_marks} Marks</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/admin/exams/scores?examId=${exam.id}`}>
                  <Button size="sm" variant="outline" className="flex-1 text-xs w-full">
                    Manage Scores
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                   <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border border-dashed rounded-xl bg-accent/5">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No Exams Scheduled</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              Click "Schedule Exam" to create your first examination for this branch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
