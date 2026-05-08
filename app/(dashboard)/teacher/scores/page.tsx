"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Plus, Eye, Pencil, FileText, Calendar, AlertTriangle, CheckCircle2, ChevronDown, Users, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { useTeacherExams, useExamMarkingStatus } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function ExamMarkingStatus({ examId, batchId }: { examId: string, batchId: string }) {
  const { data: status, isLoading } = useExamMarkingStatus(examId, batchId);
  const [expanded, setExpanded] = useState(false);

  if (isLoading) return <div className="h-20 animate-pulse bg-accent/20 rounded-lg" />;
  if (!status) return null;

  const progress = status.total > 0 ? (status.marked / status.total) * 100 : 0;
  const isFullyMarked = status.marked === status.total && status.total > 0;

  return (
    <div className="mt-4 border-t border-border/50 pt-4">
      <div className="flex items-center justify-between mb-2 cursor-pointer group" onClick={() => setExpanded(!expanded)}>
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider">Marking Progress</span>
            <span className="font-bold text-primary">{status.marked} / {status.total}</span>
          </div>
          <Progress value={progress} className={`h-1.5 ${isFullyMarked ? "[&>div]:bg-emerald-500" : ""}`} />
        </div>
        <ChevronDown className={`w-4 h-4 ml-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""} group-hover:text-primary`} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-1.5 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
              {status.students.map((student: any) => (
                <div key={student.id} className={`flex items-center justify-between p-2 rounded-md border text-xs ${student.is_marked ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/20"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${student.is_marked ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-600"}`}>
                      {student.is_marked ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    </div>
                    <span className="font-medium truncate max-w-[120px]">{student.profile?.full_name}</span>
                  </div>
                  <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ${student.is_marked ? "text-emerald-600 border-emerald-500/20" : "text-amber-600 border-amber-500/30"}`}>
                    {student.is_marked ? "Marked" : "Unmarked"}
                  </Badge>
                </div>
              ))}
              {status.students.length === 0 && (
                <div className="text-center py-4 text-xs text-muted-foreground">No students in this batch.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TeacherScoresPage() {
  const profile = useAppStore((s) => s.profile);
  const { data: exams, isLoading } = useTeacherExams(profile?.id || "");

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Exam Scores"
        subtitle="Manage exams and track marking progress."
        actions={
          <Link href="/teacher/scores/enter">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Exam / Enter Scores
            </Button>
          </Link>
        }
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {exams && exams.length > 0 ? (
          exams.map((exam) => (
            <motion.div
              key={exam.id}
              variants={fadeUp}
            >
              <Card className="h-full hover:border-primary/40 transition-all group overflow-hidden border-border/50 shadow-sm flex flex-col">
                <CardHeader className="pb-2 bg-accent/5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <Badge variant={exam.is_published ? "default" : "secondary"} className={exam.is_published ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25" : ""}>
                      {exam.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{exam.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mt-1">
                    <span className="uppercase tracking-wider">{(exam as any).subject?.name}</span>
                    <span>•</span>
                    <span className="truncate">{(exam as any).batch?.name}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col">
                  <div className="space-y-2.5 mb-2 text-xs text-muted-foreground font-medium flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{exam.exam_date ? format(new Date(exam.exam_date), "MMM d, yyyy") : "No date"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Max Marks: {exam.total_marks}</span>
                    </div>
                  </div>

                  <ExamMarkingStatus examId={exam.id} batchId={exam.batch_id || ""} />

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                    <Link href={`/teacher/scores/enter?examId=${exam.id}`} className="flex-1">
                      <Button size="sm" className="w-full text-xs gap-1.5 h-9" variant={exam.is_published ? "outline" : "default"}>
                        <Pencil className="w-3.5 h-3.5" />
                        {exam.is_published ? "Edit Scores" : "Continue Marking"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center rounded-2xl border-2 border-dashed bg-accent/5">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold">No Exams Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">
              Start by creating a new exam to record student scores and track your marking progress.
            </p>
            <Link href="/teacher/scores/enter">
              <Button className="mt-6 gap-2">
                <Plus className="w-4 h-4" /> Create First Exam
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
