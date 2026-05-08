"use client";

import { useMemo } from "react";
import { BookOpen, Users, Clock, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { useTeacherAssignments, useStudentsByBatch } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { StudentProfile } from "@/lib/types";

// A component to display students for a specific batch
function BatchStudentsList({ batchId }: { batchId: string }) {
  const { data: students, isLoading } = useStudentsByBatch(batchId);

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground animate-pulse">Loading students...</div>;

  if (!students || students.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground text-center">No students currently enrolled in this batch.</div>;
  }

  return (
    <div className="space-y-2 p-2">
      {students.map((student: StudentProfile) => (
        <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/30 transition-colors gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {student.profile?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{student.profile?.full_name}</p>
              <p className="text-xs text-muted-foreground font-mono">{student.admission_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               {student.profile?.phone && (
                 <a href={`tel:${student.profile.phone}`} className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-background rounded-md border">
                   <Phone className="w-3.5 h-3.5" />
                 </a>
               )}
               {student.profile?.email && (
                 <a href={`mailto:${student.profile.email}`} className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-background rounded-md border">
                   <Mail className="w-3.5 h-3.5" />
                 </a>
               )}
            </div>
            <Badge variant={student.status === "active" ? "default" : "secondary"} className={student.status === "active" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]" : "text-[10px]"}>
              {student.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BatchInfoPage() {
  const profile = useAppStore((s) => s.profile);
  const { data: assignments, isLoading } = useTeacherAssignments(profile?.id || "");

  // Derive unique batches from assignments
  const uniqueBatches = useMemo(() => {
    if (!assignments) return [];
    const batchMap = new Map();
    assignments.forEach((a: any) => {
      if (!batchMap.has(a.batch_id)) {
        batchMap.set(a.batch_id, {
          id: a.batch_id,
          name: a.batch?.name || "Unknown Batch",
          code: a.batch?.code || "",
          level: a.batch?.level?.name || "Unknown Level",
          capacity: a.batch?.capacity || 0,
          enrolled: a.batch?.enrolled_count || 0,
          startTime: a.batch?.start_time || "",
          endTime: a.batch?.end_time || "",
          subjects: new Set([a.subject?.name]),
        });
      } else {
        batchMap.get(a.batch_id).subjects.add(a.subject?.name);
      }
    });
    return Array.from(batchMap.values()).map(b => ({
      ...b,
      subjects: Array.from(b.subjects).filter(Boolean) as string[]
    }));
  }, [assignments]);

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Information"
        subtitle={`You are assigned to ${uniqueBatches.length} batch${uniqueBatches.length === 1 ? '' : 'es'}. View details and student rosters below.`}
        icon={BookOpen}
      />

      {uniqueBatches.length > 0 ? (
        <div className="space-y-6">
          <Accordion className="space-y-4">
            {uniqueBatches.map((batch) => (
              <AccordionItem key={batch.id} value={batch.id} className="border bg-card rounded-xl px-4 overflow-hidden shadow-sm">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 text-left gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{batch.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{batch.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <Badge variant="outline" className="text-[10px] bg-accent">{batch.level}</Badge>
                      <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">
                        <Users className="w-3 h-3 mr-1" />
                        {batch.enrolled} / {batch.capacity}
                      </Badge>
                      {batch.startTime && (
                        <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                          <Clock className="w-3 h-3 mr-1" />
                          {batch.startTime.slice(0, 5)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="mb-4 px-2 flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Your Subjects in this batch:</span>
                    {batch.subjects.map((s: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-[10px] bg-background">{s}</Badge>
                    ))}
                  </div>
                  
                  <Card className="border-border/50 shadow-none bg-accent/10">
                    <CardHeader className="py-3 px-4 border-b border-border/50">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Student Roster
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <BatchStudentsList batchId={batch.id} />
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        <div className="py-20 text-center rounded-xl border border-dashed bg-card/50">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium">No Batches Assigned</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mt-1">
            You have not been assigned to any batches yet. Contact your administrator to get assigned.
          </p>
        </div>
      )}
    </div>
  );
}
