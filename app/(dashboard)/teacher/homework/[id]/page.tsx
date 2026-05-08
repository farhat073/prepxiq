"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Clock, 
  Users, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Trophy,
  History,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { 
  useHomeworkDetails, 
  useHomeworkSubmissions, 
  useUpdateSubmission 
} from "@/lib/supabase/hooks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function HomeworkSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const homeworkId = params.id as string;

  const { data: homework, isLoading: loadingHW } = useHomeworkDetails(homeworkId);
  const { data: submissions, isLoading: loadingSubmissions } = useHomeworkSubmissions(homeworkId);
  const updateSubmission = useUpdateSubmission();

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeData, setGradeData] = useState({ marks: "", feedback: "" });

  const handleSelectSubmission = (sub: any) => {
    setSelectedSubmission(sub);
    setFormData({ 
      marks: sub.marks_given?.toString() || "", 
      feedback: sub.feedback || "" 
    });
  };

  const [formData, setFormData] = useState({ marks: "", feedback: "" });

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    
    try {
      await updateSubmission.mutateAsync({
        id: selectedSubmission.id,
        marks_given: parseFloat(formData.marks),
        feedback: formData.feedback,
        status: "reviewed"
      });
      setSelectedSubmission(null);
    } catch (err) {
      toast.error("Failed to update grade");
    }
  };

  if (loadingHW || loadingSubmissions) return <LoadingSkeleton />;

  const stats = {
    total: submissions?.length || 0,
    reviewed: submissions?.filter((s: any) => s.status === "reviewed").length || 0,
    pending: submissions?.filter((s: any) => s.status === "submitted").length || 0,
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <PageHeader 
          title="Review Submissions" 
          subtitle={homework?.title}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Hand-ins</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Reviewed</p>
              <p className="text-xl font-bold">{stats.reviewed}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pending</p>
              <p className="text-xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Max Marks</p>
              <p className="text-xl font-bold">{homework?.max_marks}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Submissions List</CardTitle>
                <Badge variant="outline" className="bg-background">
                  {homework?.batch?.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {submissions?.map((sub: any) => (
                  <div 
                    key={sub.id} 
                    className={cn(
                      "p-4 flex items-center justify-between hover:bg-accent/30 transition-colors cursor-pointer",
                      selectedSubmission?.id === sub.id && "bg-accent/50 border-l-4 border-l-primary"
                    )}
                    onClick={() => handleSelectSubmission(sub)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {sub.student?.full_name?.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{sub.student?.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Submitted {format(new Date(sub.submitted_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {sub.status === "reviewed" ? (
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">{sub.marks_given} / {homework?.max_marks}</p>
                          <Badge variant="outline" className="text-[9px] h-4 bg-emerald-50 text-emerald-600 border-emerald-200">REVIEWED</Badge>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] h-4">PENDING</Badge>
                      )}
                    </div>
                  </div>
                ))}

                {submissions?.length === 0 && (
                  <div className="py-20 text-center text-muted-foreground">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>No submissions found for this assignment.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedSubmission ? (
              <motion.div
                key="grading-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="border-primary/20 shadow-lg shadow-primary/5 sticky top-6">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Grade Submission
                    </CardTitle>
                    <CardDescription>
                      Reviewing: <span className="font-semibold text-foreground">{selectedSubmission.student?.full_name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attached Work</Label>
                      <Button variant="outline" className="w-full justify-start gap-2 h-10 border-dashed">
                        <a href={selectedSubmission.submission_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                          View Student's Work
                        </a>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Marks Obtained (Max: {homework?.max_marks})</Label>
                      <Input 
                        type="number" 
                        placeholder="0.0"
                        value={formData.marks}
                        onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                        className="h-10 font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Feedback / Remarks</Label>
                      <Textarea 
                        placeholder="Write constructive feedback here..."
                        value={formData.feedback}
                        onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <Button 
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={handleGrade}
                      disabled={updateSubmission.isPending}
                    >
                      {updateSubmission.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Submit Review
                    </Button>
                    <Button variant="ghost" className="w-full h-9 text-xs" onClick={() => setSelectedSubmission(null)}>
                      Cancel
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="select-msg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-10 border-2 border-dashed rounded-3xl text-center space-y-4"
              >
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-muted-foreground opacity-30" />
                </div>
                <div>
                  <h3 className="font-bold">Select a Student</h3>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto mt-1">
                    Click on a student's submission from the list to start grading.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Assignment Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Instructions</p>
                <p className="text-xs text-blue-900 leading-relaxed italic">
                  "{homework?.description || "No instructions provided."}"
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium text-blue-700 pt-2 border-t border-blue-200">
                <span>Due Date:</span>
                <span>{homework?.due_date ? format(new Date(homework.due_date), "PPP") : "-"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
