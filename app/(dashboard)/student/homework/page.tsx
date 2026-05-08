"use client";

import { useState } from "react";
import { BookMarked, Clock, CheckCircle2, AlertCircle, Send, Paperclip, FileText, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useHomework, useStudentProfile, useSubmitHomework, useStudentSubmissions } from "@/lib/supabase/hooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function StudentHomework() {
  const profile = useAppStore((s) => s.profile);
  const { data: studentProf } = useStudentProfile(profile?.id || "");
  const { data: homework, isLoading } = useHomework(studentProf?.current_batch_id);
  const { data: submissions, isLoading: subLoading, refetch: refetchSub } = useStudentSubmissions(profile?.id || "");
  const submitHomework = useSubmitHomework();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHW, setSelectedHW] = useState<any>(null);
  const [formData, setFormData] = useState({
    submission_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedHW) return;

    await submitHomework.mutateAsync({
      homework_id: selectedHW.id,
      student_id: profile.id,
      submission_url: formData.submission_url,
      submitted_at: new Date().toISOString(),
      status: new Date() > new Date(selectedHW.due_date) ? "late" : "submitted"
    } as any);
    
    setIsDialogOpen(false);
    setFormData({ submission_url: "" });
    refetchSub();
  };

  const getSubmissionStatus = (hwId: string) => {
    const sub = submissions?.find((s: any) => s.homework_id === hwId);
    if (!sub) return null;
    return sub;
  };

  if (isLoading || subLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Homework" 
        subtitle="View assignments and submit your work."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {homework?.map((hw: any) => {
          const submission = getSubmissionStatus(hw.id);
          const isOverdue = !submission && new Date(hw.due_date) < new Date();

          return (
            <motion.div
              key={hw.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`h-full border-l-4 ${submission ? "border-l-emerald-500" : isOverdue ? "border-l-rose-500" : "border-l-amber-500"}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {hw.subject?.name}
                    </Badge>
                    {submission ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {submission.status.toUpperCase()}
                      </Badge>
                    ) : (
                      <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-[10px] gap-1">
                        {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {isOverdue ? "OVERDUE" : `DUE ${format(new Date(hw.due_date), "MMM d")}`}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-1">{hw.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                    {hw.description || "No instructions provided."}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Assigned: {format(new Date(hw.created_at), "MMM d, yyyy")}</span>
                      <span>Max Marks: {hw.max_marks}</span>
                    </div>
                  </div>

                  {submission && submission.feedback && (
                    <div className="p-2 rounded bg-accent/30 border border-border/50 text-[11px]">
                      <span className="font-semibold text-primary block mb-1 uppercase tracking-tight">Teacher Feedback:</span>
                      <p className="text-muted-foreground italic">"{submission.feedback}"</p>
                      {submission.marks_given !== null && (
                        <p className="mt-1 font-medium text-emerald-600">Score: {submission.marks_given}/{hw.max_marks}</p>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    {submission ? (
                      <a href={submission.submission_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                          <ExternalLink className="w-3.5 h-3.5" /> View Submission
                        </Button>
                      </a>
                    ) : (
                      <Dialog open={isDialogOpen && selectedHW?.id === hw.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if(open) setSelectedHW(hw);
                      }}>
                        <DialogTrigger>
                          <Button size="sm" className="w-full text-xs gap-1.5 h-8">
                            <Send className="w-3.5 h-3.5" /> Submit Homework
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit: {hw.title}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid gap-2">
                              <Label htmlFor="suburl">Submission URL (Google Drive/OneDrive link)</Label>
                              <Input 
                                id="suburl" 
                                placeholder="https://..."
                                value={formData.submission_url} 
                                onChange={(e) => setFormData({ ...formData, submission_url: e.target.value })} 
                                required 
                              />
                              <p className="text-[10px] text-muted-foreground italic">
                                Please ensure the link is publicly accessible for your teacher to review.
                              </p>
                            </div>
                            <Button type="submit" className="w-full" disabled={submitHomework.isPending}>
                              {submitHomework.isPending ? "Submitting..." : "Send Submission"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {homework?.length === 0 && (
          <div className="col-span-full py-20 text-center border rounded-xl bg-muted/20">
            <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No homework assigned</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              Your teachers haven't assigned any homework to your batch yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}