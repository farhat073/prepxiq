"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, X, Clock, Calendar, Users, ChevronLeft, Loader2, Save, Shield } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAppStore } from "@/store/useAppStore";
import { 
  useTeacherAssignments,
  useStudentsByBatch, 
  useMarkAttendance,
  useAttendanceSessions,
} from "@/lib/supabase/hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TeacherAttendancePage() {
  const profile = useAppStore((s) => s.profile);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Use teacher assignments as the single source of truth
  const { data: assignments, isLoading: assignmentsLoading } = useTeacherAssignments(profile?.id || "");
  
  // Derive unique assignment combos: { id, batch_id, batch_name, subject_id, subject_name }
  const assignmentOptions = useMemo(() => {
    if (!assignments) return [];
    return assignments.map((a: any) => ({
      id: a.id,
      batch_id: a.batch_id,
      batch_name: a.batch?.name || "Unknown Batch",
      subject_id: a.subject_id,
      subject_name: a.subject?.name || "Unknown Subject",
      level_name: a.batch?.level?.name || "",
    }));
  }, [assignments]);

  // If teacher has only 1 assignment, auto-select it
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  
  useEffect(() => {
    if (assignmentOptions.length === 1 && !selectedAssignment) {
      setSelectedAssignment(assignmentOptions[0].id);
    }
  }, [assignmentOptions, selectedAssignment]);

  const currentAssignment = assignmentOptions.find((a: any) => a.id === selectedAssignment);
  const batchId = currentAssignment?.batch_id || "";
  const subjectId = currentAssignment?.subject_id || "";

  const [isMarking, setIsMarking] = useState(false);
  const [sessionDate, setSessionDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent" | "late" | "excused">>({});
  const [topicCovered, setTopicCovered] = useState("");
  const [notes, setNotes] = useState("");

  const { data: students, isLoading: studentsLoading } = useStudentsByBatch(batchId || undefined);
  const { data: sessions, isLoading: sessionsLoading } = useAttendanceSessions(
    batchId || undefined, 
    subjectId || undefined
  );
  
  const markAttendanceMutation = useMarkAttendance();

  // Initialize attendance records when students load
  useEffect(() => {
    if (students) {
      const initial: Record<string, "present" | "absent" | "late" | "excused"> = {};
      students.forEach(s => {
        initial[s.profile_id] = "present";
      });
      setAttendance(initial);
    }
  }, [students]);

  const handleToggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present"
    }));
  };

  const handleSubmit = async () => {
    if (!batchId || !subjectId) {
      toast.error("Please select an assignment");
      return;
    }

    const records = Object.entries(attendance).map(([studentId, status]) => ({
      student_id: studentId,
      status,
      marked_by: profile?.id
    }));

    try {
      await markAttendanceMutation.mutateAsync({
        batchId,
        subjectId,
        sessionDate,
        topicCovered,
        markedBy: profile?.id,
        records,
      });
      setIsMarking(false);
    } catch (err) {
      // Error handled by mutation
    }
  };

  if (assignmentsLoading) return <LoadingSkeleton variant="dashboard" />;

  // No assignments — show empty state
  if (!assignments || assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Shield className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold">No Assignments Yet</h2>
        <p className="text-muted-foreground max-w-sm">
          You haven&apos;t been assigned to any batches yet. Please contact your Admin to get assigned.
        </p>
      </div>
    );
  }

  if (isMarking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMarking(false)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <PageHeader 
            title="Mark Attendance" 
            subtitle={currentAssignment ? `${currentAssignment.batch_name} — ${currentAssignment.subject_name}` : "Select Assignment"} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Students List</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  const allPresent: any = {};
                  students?.forEach(s => allPresent[s.profile_id] = "present");
                  setAttendance(allPresent);
                }}>All Present</Button>
              </div>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-accent/20 animate-pulse rounded-lg" />)}
                </div>
              ) : students && students.length > 0 ? (
                <div className="space-y-2">
                  {students.map((student) => (
                    <div 
                      key={student.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        attendance[student.profile_id] === "present" 
                          ? "bg-emerald-500/5 border-emerald-500/20" 
                          : "bg-red-500/5 border-red-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {student.profile?.full_name?.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{student.profile?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{student.admission_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={attendance[student.profile_id] === "present" ? "default" : "outline"}
                          className={attendance[student.profile_id] === "present" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          onClick={() => handleToggleAttendance(student.profile_id)}
                        >
                          {attendance[student.profile_id] === "present" ? (
                            <><Check className="w-4 h-4 mr-1" /> Present</>
                          ) : (
                            <><X className="w-4 h-4 mr-1" /> Absent</>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No students assigned to this batch.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assignment Selector — only shown if teacher has multiple assignments */}
                {assignmentOptions.length > 1 && (
                  <div className="space-y-2">
                    <Label>Batch / Subject</Label>
                    <Select value={selectedAssignment} onValueChange={(val) => setSelectedAssignment(val as string)}>
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
                  </div>
                )}

                {/* Show current assignment info */}
                {currentAssignment && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-blue-500/5 text-blue-600 border-blue-500/20">
                        {currentAssignment.batch_name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">→</span>
                      <Badge variant="outline" className="text-xs bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                        {currentAssignment.subject_name}
                      </Badge>
                    </div>
                    {currentAssignment.level_name && (
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{currentAssignment.level_name}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    value={sessionDate} 
                    onChange={(e) => setSessionDate(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Topic Covered</Label>
                  <Input 
                    placeholder="e.g. Laws of Motion" 
                    value={topicCovered}
                    onChange={(e) => setTopicCovered(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea 
                    placeholder="Any special remarks..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleSubmit}
                  disabled={markAttendanceMutation.isPending || !selectedAssignment}
                >
                  {markAttendanceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Attendance
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="View history and mark daily attendance for your assigned batches."
        actions={
          <Button onClick={() => setIsMarking(true)}>
            Mark Today&apos;s Attendance
          </Button>
        }
      />

      {/* Assignment selector for history view */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-xs">Assignment</Label>
          <Select value={selectedAssignment} onValueChange={(val) => setSelectedAssignment(val as string)}>
            <SelectTrigger>
              <SelectValue placeholder="Select assignment" />
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-accent/20 animate-pulse rounded-lg" />)}
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-accent/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{format(new Date(session.session_date), "PPP")}</p>
                      <p className="text-xs text-muted-foreground">
                        {(session as any).batch?.name} • {(session as any).subject?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">{session.topic_covered || "No topic listed"}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      // Find matching assignment
                      const match = assignmentOptions.find((a: any) => a.batch_id === session.batch_id && a.subject_id === session.subject_id);
                      if (match) setSelectedAssignment(match.id);
                      setSessionDate(session.session_date);
                      setTopicCovered(session.topic_covered || "");
                      setNotes(session.notes || "");
                      setIsMarking(true);
                    }}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed rounded-xl">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No attendance sessions found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
