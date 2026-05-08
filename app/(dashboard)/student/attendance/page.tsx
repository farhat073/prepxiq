"use client";

import { CalendarDays, CheckCircle2, XCircle, Clock, AlertCircle, PieChart as PieIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { DataTable } from "@/components/shared/DataTable";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function StudentAttendancePage() {
  const profile = useAppStore((s) => s.profile);

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["student-attendance", profile?.id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*, session:attendance_sessions(*, subject:subjects(name))")
        .eq("student_id", profile?.id)
        .order("session(session_date)", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  if (isLoading) return <LoadingSkeleton />;

  const stats = {
    present: attendance?.filter((a: any) => a.status === "present").length || 0,
    absent: attendance?.filter((a: any) => a.status === "absent").length || 0,
    late: attendance?.filter((a: any) => a.status === "late").length || 0,
    excused: attendance?.filter((a: any) => a.status === "excused").length || 0,
    total: attendance?.length || 0,
  };

  const attendancePercent = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;

  const chartData = [
    { name: "Present", value: stats.present, color: "#10b981" },
    { name: "Absent", value: stats.absent, color: "#ef4444" },
    { name: "Late", value: stats.late, color: "#f59e0b" },
    { name: "Excused", value: stats.excused, color: "#6366f1" },
  ].filter(d => d.value > 0);

  const columns = [
    {
      header: "Date",
      accessorKey: "session.session_date",
      cell: (row: any) => format(new Date(row.session?.session_date), "MMM d, yyyy")
    },
    {
      header: "Subject",
      accessorKey: "session.subject.name",
    },
    {
      header: "Status",
      cell: (row: any) => {
        const s = row.status;
        return (
          <Badge className={
            s === "present" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10" :
            s === "absent" ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/10" :
            s === "late" ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/10" :
            "bg-blue-500/10 text-blue-600 hover:bg-blue-500/10"
          }>
            {s.toUpperCase()}
          </Badge>
        );
      }
    },
    {
      header: "Topic Covered",
      accessorKey: "session.topic_covered",
      cell: (row: any) => row.session?.topic_covered || "N/A"
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Attendance" 
        subtitle="Track your presence across all classes and subjects."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground uppercase font-semibold">Present</p>
            <h3 className="text-2xl font-bold">{stats.present}</h3>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <XCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground uppercase font-semibold">Absent</p>
            <h3 className="text-2xl font-bold">{stats.absent}</h3>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground uppercase font-semibold">Late</p>
            <h3 className="text-2xl font-bold">{stats.late}</h3>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <PieIcon className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground uppercase font-semibold">Attendance</p>
            <h3 className="text-2xl font-bold">{attendancePercent.toFixed(1)}%</h3>
          </CardContent></Card>
        </div>

        <Card className="flex flex-col">
          <CardHeader className="pb-0"><CardTitle className="text-sm font-medium">Distribution</CardTitle></CardHeader>
          <CardContent className="flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={attendance || []} 
            searchPlaceholder="Filter by subject..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
