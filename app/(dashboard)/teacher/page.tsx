"use client";

import { motion } from "framer-motion";
import { Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { useTeacherStats, useTeacherSchedule } from "@/lib/supabase/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function TeacherDashboard() {
  const profile = useAppStore((s) => s.profile);
  const { data: stats, isLoading: statsLoading } = useTeacherStats(profile?.id || "");
  const { data: schedule, isLoading: scheduleLoading } = useTeacherSchedule(profile?.id || "");

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todaySchedule = schedule?.filter(s => s.day_of_week === today) || [];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(" ")[0] || "Teacher"}!`}
        subtitle="Here's your teaching overview for today."
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : (
          <>
            <motion.div variants={fadeUp}><StatCard title="My Students" value={stats?.myStudents.value || 0} change={stats?.myStudents.change} icon="students" color="blue" /></motion.div>
            <motion.div variants={fadeUp}><StatCard title="Classes Today" value={stats?.classesToday.value || 0} icon="batch" color="emerald" /></motion.div>
            <motion.div variants={fadeUp}><StatCard title="Pending Scores" value={stats?.pendingScores.value || 0} icon="exam" color="amber" /></motion.div>
            <motion.div variants={fadeUp}><StatCard title="Avg Performance" value={stats?.avgPerformance.value || 0} change={stats?.avgPerformance.change} icon="students" color="purple" suffix="%" /></motion.div>
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Schedule */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Today&apos;s Schedule</h3>
          <div className="space-y-3">
            {scheduleLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
            ) : todaySchedule.length > 0 ? (
              todaySchedule.map((slot, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-accent/30 border border-border/30">
                  <div className="text-xs font-mono text-primary font-medium w-28 shrink-0">
                    {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{slot.subject?.name}</p>
                    <p className="text-xs text-muted-foreground">{slot.batch?.name} · {slot.room_number || "TBD"}</p>
                  </div>
                  <Link href={`/teacher/attendance?batchId=${slot.batch_id}&subjectId=${slot.subject_id}`}>
                    <Button size="sm" variant="outline" className="shrink-0 text-xs h-7">Mark</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No classes scheduled for today.</p>
            )}
          </div>
        </motion.div>

        {/* Batch Performance (Simplified for now) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" />Recent Batch Performance</h3>
          <div className="space-y-4">
             <p className="text-sm text-muted-foreground text-center py-8">Performance data will appear here after exams are graded.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
