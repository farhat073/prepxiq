"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ChevronLeft, 
  Save, 
  Loader2, 
  AlertCircle, 
  Trophy, 
  Users, 
  Target, 
  TrendingUp,
  FileCheck,
  LayoutDashboard
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAppStore } from "@/store/useAppStore";
import { 
  useTeacherAssignments,
  useStudentsByBatch, 
  useTeacherExams,
  useEnterScores,
  useExamScores
} from "@/lib/supabase/hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const getGrade = (marks: string, total: string) => {
  const m = parseFloat(marks);
  const t = parseFloat(total);
  if (isNaN(m) || isNaN(t) || t === 0) return "-";
  const percentage = (m / t) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

export default function EnterScoresPage() {
  const profile = useAppStore((s) => s.profile);
  const searchParams = useSearchParams();
  const router = useRouter();
  const examId = searchParams.get("examId");

  const [title, setTitle] = useState("");
  const [batchId, setBatchId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [examDate, setExamDate] = useState(new Date().toISOString().split("T")[0]);
  const [scores, setScores] = useState<Record<string, { marks: string, absent: boolean, remarks: string }>>({});

  const { data: assignments } = useTeacherAssignments(profile?.id || "");
  const { data: exams } = useTeacherExams(profile?.id || "");
  const { data: existingScores, isLoading: loadingScores } = useExamScores(examId || "");
  const { data: students, isLoading: loadingStudents } = useStudentsByBatch(batchId || undefined);

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
  
  const enterScoresMutation = useEnterScores();

  useEffect(() => {
    if (examId && exams) {
      const exam = exams.find(e => e.id === examId);
      if (exam) {
        setTitle(exam.title);
        setBatchId(exam.batch_id || "");
        setSubjectId(exam.subject_id || "");
        setTotalMarks(exam.total_marks.toString());
        if (exam.exam_date) setExamDate(exam.exam_date);
      }
    }
  }, [examId, exams]);

  useEffect(() => {
    if (existingScores) {
      const s: any = {};
      existingScores.forEach(score => {
        s[score.student_id] = {
          marks: score.marks_obtained?.toString() || "",
          absent: score.is_absent,
          remarks: score.remarks || ""
        };
      });
      setScores(s);
    } else if (students) {
      const s: any = {};
      students.forEach(student => {
        if (!scores[student.profile_id]) {
          s[student.profile_id] = { marks: "", absent: false, remarks: "" };
        }
      });
      setScores(prev => ({ ...s, ...prev }));
    }
  }, [existingScores, students]);

  const handleScoreChange = (studentId: string, field: string, value: any) => {
    // Validation: Prevent marks > totalMarks
    if (field === "marks") {
      const val = parseFloat(value);
      const max = parseFloat(totalMarks);
      if (!isNaN(val) && val > max) {
        toast.warning(`Marks cannot exceed total marks (${max})`);
        value = totalMarks;
      }
    }
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const batchStats = useMemo(() => {
    const scoresValues = Object.values(scores)
      .filter(s => !s.absent && s.marks !== "")
      .map(s => parseFloat(s.marks));
    
    if (scoresValues.length === 0) return { avg: 0, high: 0, low: 0, passCount: 0, total: 0 };
    
    const sum = scoresValues.reduce((a, b) => a + b, 0);
    const avg = sum / scoresValues.length;
    const high = Math.max(...scoresValues);
    const low = Math.min(...scoresValues);
    const passingMarksVal = parseFloat(totalMarks) * 0.4; // 40% pass criteria
    const passCount = scoresValues.filter(m => m >= passingMarksVal).length;
    
    return { avg, high, low, passCount, total: scoresValues.length };
  }, [scores, totalMarks]);

  const handleSave = async (isPublished: boolean) => {
    if (!title || !batchId || !subjectId || !totalMarks) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      let currentExamId = examId;
      const supabase = createClient();
      
      // 1. Create/Update Exam Record
      if (!currentExamId) {
        const { data: newExam, error: examError } = await supabase
          .from("exams")
          .insert({
            title,
            batch_id: batchId,
            subject_id: subjectId,
            total_marks: parseFloat(totalMarks),
            exam_date: examDate,
            created_by: profile?.id,
            type: "class_test",
            is_published: isPublished
          })
          .select()
          .single();
        
        if (examError) throw examError;
        currentExamId = newExam.id;
      } else {
        // Update exam date if changed
        await supabase.from("exams").update({ exam_date: examDate, is_published: isPublished }).eq("id", currentExamId);
      }

      // 2. Prepare Scores List
      const scoresList = Object.entries(scores).map(([studentId, data]) => ({
        student_id: studentId,
        marks_obtained: data.absent ? 0 : parseFloat(data.marks || "0"),
        is_absent: data.absent,
        remarks: data.remarks,
        grade: getGrade(data.absent ? "0" : (data.marks || "0"), totalMarks)
      }));

      // 3. Save Scores
      await enterScoresMutation.mutateAsync({
        examId: currentExamId!,
        scores: scoresList,
        enteredBy: profile?.id || "",
        isPublished
      });

      router.push("/teacher/scores");
    } catch (err: any) {
      toast.error("Failed to save scores", { description: err.message });
    }
  };

  if (examId && loadingScores) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <PageHeader 
            title={examId ? "Update Exam Results" : "Conduct New Exam"} 
            subtitle={examId ? `Marking: ${title}` : "Create an exam and record student performance."} 
          />
        </div>
        <div className="flex items-center gap-2">
           <Button 
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={enterScoresMutation.isPending}
            className="hidden md:flex"
          >
            Save as Draft
          </Button>
          <Button 
            onClick={() => handleSave(true)}
            disabled={enterScoresMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {enterScoresMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileCheck className="w-4 h-4 mr-2" />}
            Publish Results
          </Button>
        </div>
      </div>

      {/* Real-time Analytics Bar */}
      {batchId && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Batch Average</p>
                <p className="text-xl font-bold text-blue-700">{batchStats.avg.toFixed(1)} <span className="text-xs font-normal">marks</span></p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Highest Score</p>
                <p className="text-xl font-bold text-emerald-700">{batchStats.high} <span className="text-xs font-normal">marks</span></p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pass Rate</p>
                <p className="text-xl font-bold text-purple-700">
                  {batchStats.total > 0 ? Math.round((batchStats.passCount / batchStats.total) * 100) : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Marked Count</p>
                <p className="text-xl font-bold text-amber-700">{batchStats.total} <span className="text-xs font-normal">/{students?.length || 0}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div>
              <CardTitle className="text-base font-semibold">Student Roster</CardTitle>
              <CardDescription className="text-xs">Enter marks obtained by each student.</CardDescription>
            </div>
            {batchId && <Badge variant="secondary" className="font-mono text-[10px]">{students?.length || 0} Students</Badge>}
          </CardHeader>
          <CardContent className="pt-6">
            {!batchId ? (
              <div className="text-center py-20 bg-accent/5 rounded-xl border border-dashed flex flex-col items-center">
                <LayoutDashboard className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                <h3 className="font-medium text-muted-foreground">No Batch Selected</h3>
                <p className="text-xs text-muted-foreground/60 max-w-[200px] mt-1">Select a batch from the exam details to load the student list.</p>
              </div>
            ) : loadingStudents ? (
              <div className="space-y-4">
                {Array(6).fill(0).map((_, i) => <div key={i} className="h-14 bg-accent/10 animate-pulse rounded-xl" />)}
              </div>
            ) : students && students.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-6">Student Information</div>
                  <div className="col-span-2 text-center">Marks</div>
                  <div className="col-span-2 text-center">Grade</div>
                  <div className="col-span-2 text-center">Absent</div>
                </div>
                <div className="space-y-2">
                  {students.map((student) => {
                    const studentScore = scores[student.profile_id];
                    const grade = getGrade(studentScore?.marks || "0", totalMarks);
                    
                    return (
                      <div key={student.id} className={cn(
                        "grid grid-cols-12 gap-4 items-center p-3 rounded-xl transition-all border",
                        studentScore?.absent ? "bg-rose-50/30 border-rose-100 opacity-80" : "bg-card border-border/50 hover:border-primary/30"
                      )}>
                        <div className="col-span-6 flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                            studentScore?.absent ? "bg-rose-100 text-rose-600" : "bg-primary/10 text-primary"
                          )}>
                            {student.profile?.full_name?.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{student.profile?.full_name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{student.admission_number}</p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Input 
                            type="number" 
                            placeholder="0" 
                            className="text-center h-9 font-bold focus-visible:ring-primary/30"
                            disabled={studentScore?.absent}
                            value={studentScore?.marks || ""}
                            onChange={(e) => handleScoreChange(student.profile_id, "marks", e.target.value)}
                            max={totalMarks}
                            min="0"
                          />
                        </div>
                        <div className="col-span-2 text-center">
                          <Badge className={cn(
                            "w-10 h-8 justify-center text-xs font-bold",
                            grade === "A+" || grade === "A" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            grade === "F" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                            "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          )} variant="outline">
                            {studentScore?.absent ? "AB" : grade}
                          </Badge>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded-md border-border text-rose-500 focus:ring-rose-500 cursor-pointer"
                            checked={studentScore?.absent || false}
                            onChange={(e) => handleScoreChange(student.profile_id, "absent", e.target.checked)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-accent/5 rounded-xl border border-dashed flex flex-col items-center">
                 <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                 <h3 className="font-medium text-muted-foreground">Empty Batch</h3>
                 <p className="text-xs text-muted-foreground/60 max-w-[200px] mt-1">There are no students currently enrolled in this batch.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base font-semibold">Exam Configuration</CardTitle>
              <CardDescription className="text-xs">Define the parameters for this assessment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exam Title</Label>
                <Input 
                  placeholder="e.g. Unit Test 1" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!!examId}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assignment (Batch + Subject)</Label>
                <Select 
                  value={assignmentOptions.find((a: any) => a.batch_id === batchId && a.subject_id === subjectId)?.id || ""} 
                  onValueChange={(val) => {
                    const a = assignmentOptions.find((a: any) => a.id === val);
                    if (a) { setBatchId(a.batch_id); setSubjectId(a.subject_id); }
                  }} 
                  disabled={!!examId}
                >
                  <SelectTrigger className="h-10">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Marks</Label>
                  <Input 
                    type="number" 
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    disabled={!!examId}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exam Date</Label>
                  <Input 
                    type="date" 
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" 
                  onClick={() => handleSave(true)}
                  disabled={enterScoresMutation.isPending}
                >
                  {enterScoresMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <FileCheck className="w-5 h-5 mr-2" />
                  )}
                  Save & Publish Results
                </Button>
                <Button 
                  variant="outline"
                  className="w-full h-11" 
                  onClick={() => handleSave(false)}
                  disabled={enterScoresMutation.isPending}
                >
                  Save as Draft
                </Button>
                <p className="text-[10px] text-center text-muted-foreground italic">
                  * Publishing makes results visible to students and parents immediately.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Marking Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4">
                <li>Use the <b>Absent</b> checkbox for students who missed the exam.</li>
                <li>Marks are validated against <b>Max Marks</b> automatically.</li>
                <li>Save as <b>Draft</b> if you haven't finished marking everyone.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
