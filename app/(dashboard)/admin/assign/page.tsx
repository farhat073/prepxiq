"use client";

import { Shield, Users, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAllTeacherAssignments,
  useStudents,
  useUnassignedStudents,
} from "@/lib/supabase/hooks";

export default function AdminAssignPage() {
  const { data: assignments } = useAllTeacherAssignments();
  const { data: allStudents } = useStudents();
  const { data: unassigned } = useUnassignedStudents();

  const teacherCount = new Set(assignments?.map((a: any) => a.teacher_id)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        subtitle="Manage teacher and student assignments to batches."
        icon={Shield}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Teacher → Batch Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Link href="/admin/assign/teachers">
            <Card className="group hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <UserCheck className="w-6 h-6 text-blue-500" />
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-blue-500 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Teacher → Batch</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign teachers to specific batches and subjects. Teachers will only see their assigned batches.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                  <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                    {teacherCount} Teacher{teacherCount !== 1 ? "s" : ""} Assigned
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {assignments?.length || 0} Assignment{(assignments?.length || 0) !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Student → Batch Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <Link href="/admin/assign/students">
            <Card className="group hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-emerald-500/10">
                    <Users className="w-6 h-6 text-emerald-500" />
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-emerald-500 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Student → Batch</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign students to batches. Students will only see data from their assigned batch.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                  <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {allStudents?.length || 0} Student{(allStudents?.length || 0) !== 1 ? "s" : ""}
                  </Badge>
                  {(unassigned?.length || 0) > 0 && (
                    <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                      ⚠ {unassigned?.length} Unassigned
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
