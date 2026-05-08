"use client";

import { useState, useEffect } from "react";
import { Trophy, Search, Save, CheckCircle2, XCircle, AlertCircle, ChevronLeft, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSearchParams, useRouter } from "next/navigation";
import { useExams, useExamScores, useEnterScores, useTeacherStudents } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/store/useAppStore";

export default function AdminScoreEntryPage() {
  const { profile } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [examId, setExamId] = useState<string>(searchParams.get("examId") || "");
  const [search, setSearch] = useState("");

  const { data: exams, isLoading: examsLoading } = useExams();
  const selectedExam = exams?.find(e => e.id === examId);
  
  const { data: students, isLoading: studentsLoading } = useTeacherStudents(profile?.id || "", selectedExam?.batch_id);
  const { data: existingScores, isLoading: scoresLoading } = useExamScores(examId);
  
  const enterScoresMutation = useEnterScores();

  // Local state for score entry
  const [scores, setScores] = useState<Record<string, { marks: string, absent: boolean, remarks: string }>>({});

  useEffect(() => {
    if (students && existingScores) {
      const initial: Record<string, any> = {};
      students.forEach(s => {
        const existing = existingScores.find(es => es.student_id === s.profile_id);
        initial[s.profile_id] = {
          marks: existing?.marks_obtained?.toString() || "",
          absent: existing?.is_absent || false,
          remarks: existing?.remarks || "",
        };
      });
      setScores(initial);
    }
  }, [students, existingScores]);

  const handleScoreChange = (studentId: string, field: string, value: any) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleSave = async () => {
    if (!examId) return;

    const scoreData = Object.entries(scores).map(([studentId, data]) => ({
      student_id: studentId,
      marks_obtained: data.absent ? 0 : parseFloat(data.marks) || 0,
      is_absent: data.absent,
      remarks: data.remarks,
    }));

    try {
      await enterScoresMutation.mutateAsync({
        examId,
        scores: scoreData,
        enteredBy: profile?.id || ""
      });
      toast.success("Scores saved and published successfully");
    } catch (err) {
      // Error handled by mutation
    }
  };

  if (examsLoading) return <LoadingSkeleton variant="dashboard" />;

  const filteredStudents = students?.filter(s => s.profile?.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title="Score Entry"
          subtitle="Enter student marks for the selected examination."
          icon={Trophy}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selection Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Select Examination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Active Exam</Label>
                <Select value={examId} onValueChange={(v) => setExamId(v as string)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an exam..." />
                  </SelectTrigger>
                  <SelectContent>
                    {exams?.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedExam && (
                <div className="pt-4 border-t border-border/50 space-y-3">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Batch:</span>
                    <p className="font-medium">{(selectedExam as any).batch?.name}</p>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Subject:</span>
                    <p className="font-medium">{(selectedExam as any).subject?.name}</p>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Max Marks:</span>
                    <p className="font-medium">{selectedExam.total_marks}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            className="w-full" 
            onClick={handleSave} 
            disabled={!examId || enterScoresMutation.isPending || studentsLoading}
          >
            {enterScoresMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save & Publish
          </Button>
        </div>

        {/* Scoring Table */}
        <div className="lg:col-span-3">
          <Card className="min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <div>
                <CardTitle className="text-base">Student List</CardTitle>
                <CardDescription>Enter marks obtained out of {selectedExam?.total_marks || 0}</CardDescription>
              </div>
              <div className="relative w-full max-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Filter students..." 
                  className="pl-9 h-9 text-xs" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {studentsLoading || scoresLoading ? (
                <div className="p-8 space-y-4">
                  {Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-accent/20 animate-pulse rounded-lg" />)}
                </div>
              ) : !examId ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Trophy className="w-12 h-12 text-muted-foreground opacity-10 mb-4" />
                  <p className="text-muted-foreground max-w-[200px]">Please select an exam from the sidebar to begin.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-accent/30 text-xs font-medium text-muted-foreground border-b border-border/50">
                      <tr>
                        <th className="text-left p-4">Student</th>
                        <th className="text-center p-4 w-[120px]">Marks</th>
                        <th className="text-center p-4 w-[100px]">Absent</th>
                        <th className="text-left p-4">Remarks</th>
                        <th className="text-center p-4 w-[100px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredStudents?.map((student) => {
                        const studentScore = scores[student.profile_id] || { marks: "", absent: false, remarks: "" };
                        const isPassing = parseFloat(studentScore.marks) >= (selectedExam?.passing_marks || 0);
                        
                        return (
                          <tr key={student.id} className="hover:bg-accent/5 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {student.profile?.full_name?.split(" ").map((n: string) => n[0]).join("")}
                                </div>
                                <div>
                                  <p className="font-medium text-xs">{student.profile?.full_name}</p>
                                  <p className="text-[10px] text-muted-foreground">{student.admission_number}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <Input 
                                type="number"
                                placeholder="0"
                                className={`h-8 text-center font-mono ${studentScore.absent ? 'opacity-30' : ''}`}
                                disabled={studentScore.absent}
                                value={studentScore.marks}
                                onChange={(e) => handleScoreChange(student.profile_id, "marks", e.target.value)}
                              />
                            </td>
                            <td className="p-4 text-center">
                              <Checkbox 
                                checked={studentScore.absent} 
                                onCheckedChange={(val) => handleScoreChange(student.profile_id, "absent", !!val)}
                              />
                            </td>
                            <td className="p-4">
                              <Input 
                                placeholder="Add remark..." 
                                className="h-8 text-xs"
                                value={studentScore.remarks}
                                onChange={(e) => handleScoreChange(student.profile_id, "remarks", e.target.value)}
                              />
                            </td>
                            <td className="p-4 text-center">
                              {studentScore.absent ? (
                                <Badge variant="outline" className="text-rose-500 border-rose-500/30 text-[10px]">ABSENT</Badge>
                              ) : studentScore.marks !== "" ? (
                                isPassing ? (
                                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">PASS</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-rose-500 border-rose-500/30 text-[10px]">FAIL</Badge>
                                )
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 text-[10px]">PENDING</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
