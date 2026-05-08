"use client";

import { Trophy, Award, FileText, TrendingUp, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useStudentScores } from "@/lib/supabase/hooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { DataTable } from "@/components/shared/DataTable";
import { format } from "date-fns";

export default function StudentScoresPage() {
  const profile = useAppStore((s) => s.profile);
  const { data: scores, isLoading } = useStudentScores(profile?.id || "");

  if (isLoading) return <LoadingSkeleton />;

  const columns = [
    {
      header: "Exam",
      accessorKey: "exam.title",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.exam?.title}</span>
          <span className="text-[10px] text-muted-foreground uppercase">{row.exam?.type}</span>
        </div>
      )
    },
    {
      header: "Subject",
      accessorKey: "exam.subject.name",
    },
    {
      header: "Score",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">{row.marks_obtained}</span>
          <span className="text-muted-foreground">/ {row.exam?.total_marks}</span>
        </div>
      )
    },
    {
      header: "Percentage",
      cell: (row: any) => {
        const percent = (row.marks_obtained / row.exam?.total_marks) * 100;
        return (
          <Badge variant="outline" className={percent >= 80 ? "text-emerald-500 border-emerald-500/30" : percent >= 60 ? "text-blue-500 border-blue-500/30" : "text-amber-500 border-amber-500/30"}>
            {percent.toFixed(1)}%
          </Badge>
        );
      }
    },
    {
      header: "Result",
      cell: (row: any) => {
        const passed = row.marks_obtained >= (row.exam?.passing_marks || 0);
        return (
          <div className="flex items-center gap-2">
            <Badge className={passed ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10" : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/10"}>
              {passed ? "PASSED" : "FAILED"}
            </Badge>
            {row.grade && <Badge variant="outline" className="font-bold">{row.grade}</Badge>}
          </div>
        );
      }
    },
    {
      header: "Date",
      accessorKey: "updated_at",
      cell: (row: any) => format(new Date(row.updated_at), "MMM d, yyyy")
    }
  ];

  // Stats calculation
  const avgPercent = scores?.length 
    ? scores.reduce((acc: number, s: any) => acc + (s.marks_obtained / s.exam?.total_marks) * 100, 0) / scores.length 
    : 0;
  
  const totalPassed = scores?.filter((s: any) => s.marks_obtained >= (s.exam?.passing_marks || 0)).length || 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Exam Scores" 
        subtitle="View your detailed performance across all subjects and exams."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Performance</p>
                <h3 className="text-2xl font-bold">{avgPercent.toFixed(1)}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exams Passed</p>
                <h3 className="text-2xl font-bold">{totalPassed} / {scores?.length || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Highest Score</p>
                <h3 className="text-2xl font-bold">
                  {scores?.length ? Math.max(...scores.map((s: any) => (s.marks_obtained / s.exam?.total_marks) * 100)).toFixed(1) : 0}%
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Performance History</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1"><Filter className="w-3 h-3" /> All Exams</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={scores || []} 
            searchPlaceholder="Filter exams..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
