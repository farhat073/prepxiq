"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  GraduationCap,
  Users,
  CalendarCheck,
  DollarSign,
  UserPlus,
  Plus,
  AlertTriangle,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  demoStats,
  batchStudentData,
  feeCollectionData,
  demoProfiles,
  demoFeeRecords,
  demoExams,
} from "@/lib/demo-data";

const attendanceHeatmap = [
  { batch: "Foundation Alpha", mon: 92, tue: 88, wed: 95, thu: 90, fri: 87 },
  { batch: "JEE Mains A", mon: 85, tue: 92, wed: 88, thu: 95, fri: 90 },
  { batch: "NEET Warriors", mon: 90, tue: 85, wed: 92, thu: 88, fri: 95 },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminDashboard() {
  const stats = demoStats.admin;
  const students = demoProfiles.filter((p) => p.role === "student");
  const overdueStudents = demoFeeRecords.filter((f) => f.status === "overdue");

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <PageHeader
        title="Dashboard"
        subtitle="Manage your center's operations at a glance."
        actions={
          <div className="flex gap-2">
            <Link href="/admin/students/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Row */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
      >
        <motion.div variants={fadeUp}>
          <StatCard
            title="Active Students"
            value={stats.activeStudents.value}
            change={stats.activeStudents.change}
            icon="students"
            color="blue"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            title="Teachers"
            value={stats.totalTeachers.value}
            change={stats.totalTeachers.change}
            icon="users"
            color="emerald"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            title="Attendance Today"
            value={stats.attendanceToday.value}
            change={stats.attendanceToday.change}
            icon="attendance"
            color="purple"
            suffix="%"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            title="Fees Collected"
            value={stats.feesCollected.value}
            change={stats.feesCollected.change}
            icon="dollar"
            color="amber"
            prefix="₹"
          />
        </motion.div>
        <motion.div variants={fadeUp} className="col-span-2 lg:col-span-1">
          <StatCard
            title="Pending Admissions"
            value={stats.pendingAdmissions.value}
            change={stats.pendingAdmissions.change}
            changeType="down"
            icon="clipboard"
            color="rose"
          />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Batch-wise Student Count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-sm font-semibold mb-4">Students per Batch</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={batchStudentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }} />
              <Bar dataKey="students" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Fee Collection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-sm font-semibold mb-4">Fee Collection Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={feeCollectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${(v/1000)}k`} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }} formatter={(v) => [`₹${Number(v).toLocaleString()}`, ""]} />
              <Line type="monotone" dataKey="collected" stroke="#10B981" strokeWidth={2.5} dot={{ fill: "#10B981", r: 4 }} name="Collected" />
              <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#F59E0B", r: 3 }} name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Alerts + Attendance Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Alerts & Attention Needed
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Low Attendance</p>
                <p className="text-xs text-muted-foreground">2 students below 75% attendance this month</p>
              </div>
              <Badge variant="destructive" className="ml-auto shrink-0 text-[10px]">Critical</Badge>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Fee Overdue</p>
                <p className="text-xs text-muted-foreground">{overdueStudents.length} student(s) have overdue fees</p>
              </div>
              <Badge className="ml-auto shrink-0 text-[10px] bg-amber-500/15 text-amber-500 border-amber-500/20">Warning</Badge>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Upcoming Exams</p>
                <p className="text-xs text-muted-foreground">{demoExams.length} exams scheduled this month</p>
              </div>
              <Badge className="ml-auto shrink-0 text-[10px] bg-blue-500/15 text-blue-500 border-blue-500/20">Info</Badge>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Pending Follow-ups</p>
                <p className="text-xs text-muted-foreground">3 admission inquiries need follow-up</p>
              </div>
              <Badge className="ml-auto shrink-0 text-[10px] bg-purple-500/15 text-purple-500 border-purple-500/20">Pending</Badge>
            </div>
          </div>
        </motion.div>

        {/* Attendance Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-sm font-semibold mb-4">Weekly Attendance %</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3 pr-3">Batch</th>
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                    <th key={d} className="text-center text-xs text-muted-foreground font-medium pb-3 px-2">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendanceHeatmap.map((row) => (
                  <tr key={row.batch}>
                    <td className="text-xs font-medium py-2 pr-3 truncate max-w-[120px]">{row.batch}</td>
                    {[row.mon, row.tue, row.wed, row.thu, row.fri].map((val, i) => (
                      <td key={i} className="text-center py-2 px-2">
                        <div
                          className={`inline-flex items-center justify-center w-10 h-8 rounded-md text-xs font-mono font-medium ${
                            val >= 90
                              ? "bg-emerald-500/15 text-emerald-500"
                              : val >= 80
                              ? "bg-blue-500/15 text-blue-500"
                              : val >= 70
                              ? "bg-amber-500/15 text-amber-500"
                              : "bg-red-500/15 text-red-500"
                          }`}
                        >
                          {val}%
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Recent Enrollments */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-xl border border-border/50 bg-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Recent Enrollments</h3>
          <Link href="/admin/students">
            <Button variant="ghost" size="sm" className="text-xs h-7">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {students.slice(0, 5).map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:border-primary/20 hover:bg-accent/30 transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-primary">
                  {student.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{student.full_name}</p>
                <p className="text-xs text-muted-foreground">Foundation Alpha</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
