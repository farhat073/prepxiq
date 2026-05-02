"use client";

import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { CalendarCheck, Trophy, Award, BookMarked, Clock, FileText, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { demoStats, studentScoreTrend, demoAnnouncements, demoExams } from "@/lib/demo-data";
import { useAppStore } from "@/store/useAppStore";

const todayClasses = [
  { time: "09:00 - 11:00", subject: "Physics", teacher: "Dr. Ravi Sharma", room: "R-101" },
  { time: "11:30 - 13:00", subject: "Mathematics", teacher: "Priya Gupta", room: "R-101" },
];

const recentScores = [
  { subject: "Physics", exam: "Mid-Term", marks: 78, total: 100, grade: "B+" },
  { subject: "Chemistry", exam: "Quiz 1", marks: 42, total: 50, grade: "A" },
  { subject: "Mathematics", exam: "Mock Test", marks: 85, total: 100, grade: "A" },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function StudentDashboard() {
  const stats = demoStats.student;
  const profile = useAppStore((s) => s.profile);

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
            value={stats.attendancePercent.value}
            change={stats.attendancePercent.change}
            icon="attendance"
            color={stats.attendancePercent.value >= 75 ? "emerald" : stats.attendancePercent.value >= 60 ? "amber" : "rose"}
            suffix="%"
          />
        </motion.div>
        <motion.div variants={fadeUp}><StatCard title="Average Score" value={stats.averageScore.value} change={stats.averageScore.change} icon="exam" color="blue" suffix="%" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Batch Rank" value={`#${stats.batchRank.value}`} change={stats.batchRank.change} changeType="up" icon="students" color="purple" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Pending Homework" value={stats.pendingHomework.value} icon="clipboard" color="amber" /></motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" />Score Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={studentScoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="exam" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: "#2563EB", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Today's Timetable */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Today&apos;s Classes</h3>
          <div className="space-y-3">
            {todayClasses.map((slot, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-accent/30 border border-border/30">
                <div className="text-xs font-mono text-primary font-medium w-28 shrink-0">{slot.time}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{slot.subject}</p>
                  <p className="text-xs text-muted-foreground">{slot.teacher} · {slot.room}</p>
                </div>
              </div>
            ))}
            {todayClasses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No classes today! 🎉
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Scores + Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" />Recent Scores</h3>
          <div className="space-y-3">
            {recentScores.map((score, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-border/30">
                <div>
                  <p className="text-sm font-medium">{score.subject} — {score.exam}</p>
                  <p className="text-xs text-muted-foreground">{score.marks}/{score.total}</p>
                </div>
                <Badge className={`text-xs ${score.marks / score.total >= 0.8 ? "bg-emerald-500/15 text-emerald-500" : score.marks / score.total >= 0.6 ? "bg-blue-500/15 text-blue-500" : "bg-amber-500/15 text-amber-500"}`}>
                  {score.grade}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-purple-500" />Recent Notices</h3>
          <div className="space-y-3">
            {demoAnnouncements.slice(0, 3).map((a) => (
              <div key={a.id} className="p-3 rounded-lg bg-accent/20 border border-border/30">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{a.title}</p>
                  {a.is_pinned && <Badge variant="secondary" className="text-[10px] shrink-0">Pinned</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
