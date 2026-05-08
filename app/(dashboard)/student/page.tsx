"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { CalendarCheck, Trophy, Award, BookMarked, Clock, FileText, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { useStudentStats, useStudentTimetable, useStudentScores, useAnnouncements, useStudentProfile } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { format } from "date-fns";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function StudentDashboard() {
  const profile = useAppStore((s) => s.profile);
  const { data: studentProf } = useStudentProfile(profile?.id || "");
  const { data: stats, isLoading: statsLoading } = useStudentStats(profile?.id || "");
  const { data: timetable, isLoading: timetableLoading } = useStudentTimetable(studentProf?.current_batch_id || "");
  const { data: scores, isLoading: scoresLoading } = useStudentScores(profile?.id || "");
  const { data: announcements, isLoading: annLoading } = useAnnouncements('student', profile?.branch_id);

  if (statsLoading || timetableLoading || scoresLoading || annLoading) return <LoadingSkeleton />;

  // Filter today's classes
  const today = format(new Date(), 'eeee').toLowerCase();
  const todayClasses = timetable?.filter((t: any) => t.day_of_week === today) || [];

  // Prepare score trend data for chart
  const chartData = scores?.slice(0, 6).reverse().map((s: any) => ({
    exam: s.exam?.title,
    score: (s.marks_obtained / s.exam?.total_marks) * 100
  })) || [];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <PageHeader
        title={`Hello, ${profile?.full_name?.split(" ")[0] || "Student"}! 👋`}
        subtitle="Track your progress and stay on top of your studies."
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <motion.div variants={fadeUp}>
          <StatCard
            title="Attendance"
            value={stats?.attendancePercent.value || 0}
            change={stats?.attendancePercent.change || 0}
            icon="attendance"
            color={(stats?.attendancePercent.value || 0) >= 75 ? "emerald" : (stats?.attendancePercent.value || 0) >= 60 ? "amber" : "rose"}
            suffix="%"
          />
        </motion.div>
        <motion.div variants={fadeUp}><StatCard title="Average Score" value={stats?.averageScore.value || 0} change={stats?.averageScore.change || 0} icon="exam" color="blue" suffix="%" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Batch Rank" value={stats?.batchRank.value ? `#${stats.batchRank.value}` : "N/A"} change={stats?.batchRank.change || 0} changeType="up" icon="students" color="purple" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Pending Homework" value={stats?.pendingHomework.value || 0} icon="clipboard" color="amber" /></motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" />Score Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="exam" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: "#2563EB", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
               <Award className="w-8 h-8 mb-2 opacity-20" />
               No exam scores yet
            </div>
          )}
        </motion.div>

        {/* Today's Timetable */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Today&apos;s Classes</h3>
          <div className="space-y-3">
            {todayClasses.map((slot: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-accent/30 border border-border/30">
                <div className="text-xs font-mono text-primary font-medium w-28 shrink-0">
                  {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{slot.subject?.name}</p>
                  <p className="text-xs text-muted-foreground">{slot.teacher?.full_name} · {slot.room_number || 'N/A'}</p>
                </div>
              </div>
            ))}
            {todayClasses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center">
                <CalendarCheck className="w-10 h-10 mb-2 opacity-10" />
                No classes today! 🎉
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Scores + Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" />Recent Scores</h3>
            <Link href="/student/scores"><Button variant="ghost" size="sm" className="text-xs h-7">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {scores?.slice(0, 3).map((score: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-border/30">
                <div>
                  <p className="text-sm font-medium">{score.exam?.subject?.name} — {score.exam?.title}</p>
                  <p className="text-xs text-muted-foreground">{score.marks_obtained}/{score.exam?.total_marks}</p>
                </div>
                <Badge className={`text-xs ${score.marks_obtained / score.exam?.total_marks >= 0.8 ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15" : score.marks_obtained / score.exam?.total_marks >= 0.6 ? "bg-blue-500/15 text-blue-500 hover:bg-blue-500/15" : "bg-amber-500/15 text-amber-500 hover:bg-amber-500/15"}`}>
                  {score.marks_obtained >= (score.exam?.passing_marks || 0) ? "PASSED" : "FAILED"}
                </Badge>
              </div>
            ))}
            {(!scores || scores.length === 0) && (
               <div className="text-center py-10 text-muted-foreground text-xs">No recent scores</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-purple-500" />Recent Notices</h3>
            <Link href="/student/notices"><Button variant="ghost" size="sm" className="text-xs h-7">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {announcements?.slice(0, 3).map((a: any) => (
              <div key={a.id} className="p-3 rounded-lg bg-accent/20 border border-border/30">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{a.title}</p>
                  {a.is_pinned && <Badge variant="secondary" className="text-[10px] shrink-0">Pinned</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {format(new Date(a.created_at), "MMM d, yyyy")}
                </p>
              </div>
            ))}
            {(!announcements || announcements.length === 0) && (
               <div className="text-center py-10 text-muted-foreground text-xs">No recent notices</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
