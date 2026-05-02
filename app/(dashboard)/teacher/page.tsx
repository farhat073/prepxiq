"use client";

import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Users, BookOpen, FileText, Trophy, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { demoStats, demoBatches, demoExams } from "@/lib/demo-data";
import { useAppStore } from "@/store/useAppStore";

const todaySchedule = [
  { time: "09:00 - 11:00", batch: "Foundation Alpha", subject: "Physics", room: "R-101" },
  { time: "11:30 - 13:00", batch: "Foundation Alpha", subject: "Mathematics", room: "R-101" },
  { time: "14:00 - 17:00", batch: "JEE Mains A", subject: "Physics", room: "R-201" },
];

const batchPerformance = [
  { batch: "Foundation Alpha", avgScore: 72 },
  { batch: "JEE Mains A", avgScore: 68 },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function TeacherDashboard() {
  const stats = demoStats.teacher;
  const profile = useAppStore((s) => s.profile);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(" ")[0] || "Teacher"}!`}
        subtitle="Here's your teaching overview for today."
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <motion.div variants={fadeUp}><StatCard title="My Students" value={stats.myStudents.value} change={stats.myStudents.change} icon="students" color="blue" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Classes Today" value={stats.classesToday.value} icon="batch" color="emerald" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Pending Scores" value={stats.pendingScores.value} icon="exam" color="amber" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Avg Performance" value={stats.avgPerformance.value} change={stats.avgPerformance.change} icon="students" color="purple" suffix="%" /></motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Schedule */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Today&apos;s Schedule</h3>
          <div className="space-y-3">
            {todaySchedule.map((slot, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-accent/30 border border-border/30">
                <div className="text-xs font-mono text-primary font-medium w-28 shrink-0">{slot.time}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{slot.subject}</p>
                  <p className="text-xs text-muted-foreground">{slot.batch} · {slot.room}</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 text-xs h-7">Mark Attendance</Button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Batch Performance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" />Batch Performance</h3>
          <div className="space-y-4">
            {batchPerformance.map((b) => (
              <div key={b.batch} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{b.batch}</span>
                  <span className="font-mono text-primary">{b.avgScore}%</span>
                </div>
                <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.avgScore}%` }} transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${b.avgScore >= 75 ? "bg-emerald-500" : b.avgScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
