"use client";

import { useState } from "react";
import { CalendarCheck, ChevronLeft, Save, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRouter } from "next/navigation";
import { useBatches, useSubjects, useStudentsByBatch, useMarkAttendance } from "@/lib/supabase/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";

export default function AdminMarkAttendancePage() {
  const router = useRouter();
  const { profile } = useAppStore();
  const [batchId, setBatchId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setToday] = useState(new Date().toISOString().split('T')[0]);

  const { data: batches } = useBatches();
  const { data: subjects } = useSubjects();
  // Use batch-scoped query instead of teacher-scoped query
  const { data: students, isLoading: studentsLoading } = useStudentsByBatch(batchId || undefined);
  
  const markAttendanceMutation = useMarkAttendance();
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  const handleToggle = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present"
    }));
  };

  const handleSave = async () => {
    if (!batchId || !subjectId) {
      toast.error("Please select batch and subject");
      return;
    }

    const records = students?.map(s => ({
      student_id: s.profile_id,
      status: attendance[s.profile_id] || "present" // Default to present
    })) || [];

    try {
      await markAttendanceMutation.mutateAsync({
        batchId,
        subjectId,
        sessionDate: date,
        topicCovered: topic,
        markedBy: profile?.id || "",
        records
      });
      router.push("/admin/attendance");
    } catch (err) {
      // Handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title="Mark Attendance"
          subtitle="Record attendance for any batch and session."
          icon={CalendarCheck}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-sm">Session Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setToday(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Batch</Label>
              <Select value={batchId} onValueChange={(v) => setBatchId(v as string)}>
                <SelectTrigger><SelectValue placeholder="Select Batch" /></SelectTrigger>
                <SelectContent>
                  {batches?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={(v) => setSubjectId(v as string)}>
                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>
                  {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Topic Covered</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Algebra Intro" />
            </div>
            <Button className="w-full mt-4" onClick={handleSave} disabled={markAttendanceMutation.isPending || !batchId}>
              {markAttendanceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Attendance
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Student List</CardTitle>
            <CardDescription>Toggle checkboxes to mark students as absent. All are present by default.</CardDescription>
          </CardHeader>
          <CardContent>
            {!batchId ? (
              <div className="py-20 text-center text-muted-foreground italic">Select a batch to view students.</div>
            ) : studentsLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => <div key={i} className="h-10 bg-accent/20 animate-pulse rounded" />)}
              </div>
            ) : students && students.length > 0 ? (
              <div className="divide-y divide-border/30">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary uppercase">
                         {student.profile?.full_name?.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.profile?.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">{student.admission_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold uppercase ${attendance[student.profile_id] === 'absent' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {attendance[student.profile_id] === 'absent' ? 'Absent' : 'Present'}
                      </span>
                      <Checkbox 
                        checked={attendance[student.profile_id] !== 'absent'} 
                        onCheckedChange={() => handleToggle(student.profile_id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-muted-foreground italic">No students enrolled in this batch.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
