"use client";

import { useState } from "react";
import { CalendarCheck, Search, Filter, Download, Users, BookOpen, Clock, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAttendanceSessions, useBatches, useSubjects } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import Link from "next/link";

export default function AdminAttendancePage() {
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  
  const { data: batches } = useBatches();
  const { data: subjects } = useSubjects();
  const { data: sessions, isLoading } = useAttendanceSessions(
    selectedBatch === "all" ? undefined : selectedBatch,
    selectedSubject === "all" ? undefined : selectedSubject
  );

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Tracking"
        subtitle="Monitor student presence and view detailed attendance history."
        icon={CalendarCheck}
        actions={
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Select value={selectedBatch} onValueChange={(v) => setSelectedBatch(v as string)}>
              <SelectTrigger>
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v as string)}>
              <SelectTrigger>
                <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sessions && sessions.length > 0 ? (
          sessions.map((session: any) => (
            <Card key={session.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary">
                      <span className="text-[10px] font-bold uppercase leading-none">{format(new Date(session.session_date), "MMM")}</span>
                      <span className="text-lg font-black leading-none">{format(new Date(session.session_date), "dd")}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{session.batch?.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] py-0">{session.subject?.name}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.start_time?.slice(0, 5) || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">Topic</p>
                      <p className="text-xs font-semibold max-w-[150px] truncate">{session.topic_covered || "Not recorded"}</p>
                    </div>
                    <div className="flex items-center gap-4 border-l border-border/50 pl-6">
                       <Link href={`/admin/attendance/${session.id}`}>
                         <Button variant="ghost" size="sm" className="h-8 text-xs gap-2">
                           View Details
                           <ChevronRight className="w-3 h-3" />
                         </Button>
                       </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-24 text-center border border-dashed rounded-xl bg-accent/5">
            <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No Attendance Data</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              Select different filters or wait for teachers to mark attendance for their batches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
