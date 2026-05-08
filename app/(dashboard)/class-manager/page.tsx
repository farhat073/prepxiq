"use client";

import { motion } from "framer-motion";
import { Calendar, Users, Clock, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { StatCard } from "@/components/shared/StatCard";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function ClassManagerDashboard() {
  const profile = useAppStore((s) => s.profile);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(" ")[0] || "Manager"}!`}
        subtitle="Manage and schedule classes across all batches."
        icon={CalendarCheck}
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}><StatCard title="Active Classes" value={45} icon="batch" color="emerald" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Teachers Assigned" value={12} icon="teachers" color="blue" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Total Slots" value={156} icon="calendar" color="purple" /></motion.div>
        <motion.div variants={fadeUp}><StatCard title="Today's Classes" value={8} icon="clock" color="amber" /></motion.div>
      </motion.div>

      <div className="py-20 text-center rounded-xl border border-dashed bg-card/50">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-medium">Quick Stats Placeholder</h3>
        <p className="text-muted-foreground max-w-xs mx-auto mt-1">
          Real-time statistics will appear here as you create and manage timetable slots.
        </p>
      </div>
    </div>
  );
}
