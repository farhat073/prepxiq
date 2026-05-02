"use client";

import { motion } from "framer-motion";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  GraduationCap,
  Building2,
  DollarSign,
  Plus,
  ClipboardList,
  Download,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  demoStats,
  enrollmentChartData,
  batchStudentData,
  demoAuditLogs,
  demoProfiles,
} from "@/lib/demo-data";

const statusDistribution = [
  { name: "Active", value: 8, color: "#10B981" },
  { name: "Inactive", value: 1, color: "#6B7280" },
  { name: "Graduated", value: 1, color: "#3B82F6" },
];

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SuperadminDashboard() {
  const stats = demoStats.superadmin;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your system overview."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Branch
            </Button>
          </div>
        }
      />

      {/* Stats Row */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={fadeUp}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents.value}
            change={stats.totalStudents.change}
            icon="students"
            color="blue"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers.value}
            change={stats.totalTeachers.change}
            icon="users"
            color="emerald"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            title="Total Branches"
            value={stats.totalBranches.value}
            change={stats.totalBranches.change}
            icon="branch"
            color="purple"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            title="Revenue This Month"
            value={stats.revenueThisMonth.value}
            change={stats.revenueThisMonth.change}
            icon="dollar"
            color="amber"
            prefix="₹"
          />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Enrollment Trend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-sm font-semibold mb-4">Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={enrollmentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ fill: "#2563EB", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#2563EB" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-sm font-semibold mb-4">Student Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            {statusDistribution.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-muted-foreground">{s.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Students per Branch + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Students per Branch */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-sm font-semibold mb-4">Students per Batch</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={batchStudentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="students" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-xs h-7">
              View All
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {demoAuditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 pb-3 border-b border-border/30 last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ClipboardList className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{log.user?.full_name}</span>{" "}
                    <span className="text-muted-foreground">{log.action}</span>{" "}
                    a{" "}
                    <span className="font-medium">{log.resource}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(log.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: "Add Branch", icon: Building2, href: "/superadmin/branches/new" },
          { label: "Add Admin", icon: Users, href: "/superadmin/users/new" },
          { label: "Audit Logs", icon: ClipboardList, href: "/superadmin/audit-logs" },
          { label: "Export Data", icon: Download, href: "#" },
        ].map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            <action.icon className="w-5 h-5 text-primary" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </motion.div>
    </div>
  );
}
