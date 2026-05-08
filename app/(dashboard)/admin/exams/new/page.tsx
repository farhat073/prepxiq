"use client";

import { useState } from "react";
import { FileText, Plus, ChevronLeft, Save, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRouter } from "next/navigation";
import { useCreateExam, useSubjects, useBatches, useAcademicYears } from "@/lib/supabase/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

export default function AdminNewExamPage() {
  const router = useRouter();
  const { profile } = useAppStore();
  const { data: subjects } = useSubjects();
  const { data: batches } = useBatches();
  const { data: academicYears } = useAcademicYears();
  const createExamMutation = useCreateExam();

  const [formData, setFormData] = useState({
    title: "",
    type: "exam",
    subject_id: "",
    batch_id: "",
    academic_year_id: "",
    exam_date: "",
    total_marks: "100",
    passing_marks: "35",
    duration_minutes: "180",
    instructions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batch_id || !formData.subject_id || !formData.academic_year_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createExamMutation.mutateAsync({
        ...formData,
        total_marks: parseFloat(formData.total_marks),
        passing_marks: parseFloat(formData.passing_marks),
        duration_minutes: parseInt(formData.duration_minutes),
        created_by: profile?.id,
      });
      router.push("/admin/exams");
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title="Schedule New Exam"
          subtitle="Define assessment criteria and schedule for a batch."
          icon={Plus}
        />
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Examination Details</CardTitle>
              <CardDescription>All fields are required unless marked optional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Quarter 1 - Final Assessment" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Batch</Label>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Exam Date</Label>
                  <Input type="date" value={formData.exam_date} onChange={(e) => setFormData({...formData, exam_date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Duration (Min)</Label>
                  <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input type="number" value={formData.total_marks} onChange={(e) => setFormData({...formData, total_marks: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Instructions (Optional)</Label>
                <Textarea 
                  placeholder="e.g. Negative marking applies, Bring your own stationery..." 
                  rows={4}
                  value={formData.instructions} 
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})} 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" type="button" onClick={() => router.back()}>Cancel</Button>
                <Button className="flex-1" type="submit" disabled={createExamMutation.isPending}>
                  {createExamMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Schedule Examination
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
