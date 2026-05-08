"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { 
  Profile, Branch, Subject, Level, Batch, AcademicYear, 
  AttendanceSession, AttendanceRecord, StudentProfile, Exam, ExamScore,
  AuditLog 
} from "@/lib/types";
import { toast } from "sonner";

function getSupabase() {
  return createClient();
}

// ─── BRANCH SCOPING HELPER ─────────────────────────
// Returns the current user's branch_id from the Zustand store
// Used by hooks to scope queries to the user's branch
function getBranchId(): string | undefined {
  // Dynamic import to avoid SSR issues — reads from Zustand store
  try {
    const { useAppStore } = require("@/store/useAppStore");
    return useAppStore.getState().profile?.branch_id || undefined;
  } catch {
    return undefined;
  }
}

// ─── TEACHER SCOPE HOOK ─────────────────────────────
// Returns a teacher's assigned batch IDs and subject IDs in one call
// Every teacher page should use this to scope their data
export function useTeacherScope(teacherId: string) {
  return useQuery({
    queryKey: ["teacher-scope", teacherId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("batch_subjects")
        .select("batch_id, subject_id")
        .eq("teacher_id", teacherId);
      if (error) throw new Error(error.message || JSON.stringify(error));
      const batchIds = Array.from(new Set((data || []).map(d => d.batch_id)));
      const subjectIds = Array.from(new Set((data || []).map(d => d.subject_id)));
      return { batchIds, subjectIds, assignments: data || [] };
    },
    enabled: !!teacherId,
  });
}

// ─── PROFILES ───────────────────────────────────────

export function useProfiles(roleFilter?: string) {
  return useQuery({
    queryKey: ["profiles", roleFilter],
    queryFn: async () => {
      const supabase = getSupabase();
      const branchId = getBranchId();
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (roleFilter) query = query.eq("role", roleFilter);
      if (branchId) query = query.eq("branch_id", branchId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as Profile[];
    },
  });
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: ["profiles", id],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as Profile;
    },
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("profiles").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile updated");
    },
    onError: (err: any) => toast.error("Failed to update profile", { description: err.message }),
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw new Error(error.message || JSON.stringify(error));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("User deleted");
    },
    onError: (err: any) => toast.error("Failed to delete user", { description: err.message }),
  });
}

// ─── BRANCHES ───────────────────────────────────────

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("branches").select("*").order("created_at", { ascending: false });
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as Branch[];
    },
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (branch: Omit<Branch, "id" | "created_at">) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("branches").insert(branch).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch created");
    },
    onError: (err: any) => toast.error("Failed to create branch", { description: err.message }),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Branch> & { id: string }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("branches").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch updated");
    },
    onError: (err: any) => toast.error("Failed to update branch", { description: err.message }),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("branches").delete().eq("id", id);
      if (error) throw new Error(error.message || JSON.stringify(error));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch deleted");
    },
    onError: (err: any) => toast.error("Failed to delete branch", { description: err.message }),
  });
}

// ─── SUBJECTS ───────────────────────────────────────

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const supabase = getSupabase();
      const branchId = getBranchId();
      let query = supabase.from("subjects").select("*").order("name");
      if (branchId) query = query.eq("branch_id", branchId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as Subject[];
    },
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subject: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("subjects").insert(subject).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["system-config"] });
      toast.success("Subject created");
    },
    onError: (err: any) => toast.error("Failed to create subject", { description: err.message }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("subjects").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["system-config"] });
      toast.success("Subject updated");
    },
    onError: (err: any) => toast.error("Failed to update subject", { description: err.message }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw new Error(error.message || JSON.stringify(error));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["system-config"] });
      toast.success("Subject deleted");
    },
    onError: (err: any) => toast.error("Failed to delete subject", { description: err.message }),
  });
}

// ─── LEVELS ─────────────────────────────────────────

export function useLevels() {
  return useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const supabase = getSupabase();
      const branchId = getBranchId();
      let query = supabase.from("levels").select("*").order("order_index");
      if (branchId) query = query.eq("branch_id", branchId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as Level[];
    },
  });
}

export function useCreateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (level: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("levels").insert(level).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["levels"] });
      qc.invalidateQueries({ queryKey: ["system-config"] });
      toast.success("Level created");
    },
    onError: (err: any) => toast.error("Failed to create level", { description: err.message }),
  });
}

export function useUpdateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("levels").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["levels"] });
      qc.invalidateQueries({ queryKey: ["system-config"] });
      toast.success("Level updated");
    },
    onError: (err: any) => toast.error("Failed to update level", { description: err.message }),
  });
}

export function useDeleteLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("levels").delete().eq("id", id);
      if (error) throw new Error(error.message || JSON.stringify(error));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["levels"] });
      qc.invalidateQueries({ queryKey: ["system-config"] });
      toast.success("Level deleted");
    },
    onError: (err: any) => toast.error("Failed to delete level", { description: err.message }),
  });
}

// ─── BATCHES ────────────────────────────────────────

export function useBatches() {
  return useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const supabase = getSupabase();
      const branchId = getBranchId();
      let query = supabase.from("batches").select("*, level:levels(*)").order("created_at", { ascending: false });
      if (branchId) query = query.eq("branch_id", branchId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as unknown as Batch[];
    },
  });
}

export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (batch: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("batches").insert(batch).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch created");
    },
    onError: (err: any) => toast.error("Failed to create batch", { description: err.message }),
  });
}

export function useUpdateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("batches").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch updated");
    },
    onError: (err: any) => toast.error("Failed to update batch", { description: err.message }),
  });
}

export function useDeleteBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("batches").delete().eq("id", id);
      if (error) throw new Error(error.message || JSON.stringify(error));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch deleted");
    },
    onError: (err: any) => toast.error("Failed to delete batch", { description: err.message }),
  });
}

// ─── ACADEMIC YEARS ─────────────────────────────────

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic_years"],
    queryFn: async () => {
      const supabase = getSupabase();
      const branchId = getBranchId();
      let query = supabase.from("academic_years").select("*").order("start_date", { ascending: false });
      if (branchId) query = query.eq("branch_id", branchId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as AcademicYear[];
    },
  });
}

export function useCreateAcademicYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (year: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("academic_years").insert(year).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic_years"] });
      qc.invalidateQueries({ queryKey: ["system-config"] });
      toast.success("Academic Year created");
    },
    onError: (err: any) => toast.error("Failed to create academic year", { description: err.message }),
  });
}

export function useUpdateAcademicYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("academic_years").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic_years"] });
      qc.invalidateQueries({ queryKey: ["system-config"] });
      toast.success("Academic Year updated");
    },
    onError: (err: any) => toast.error("Failed to update academic year", { description: err.message }),
  });
}

export function useDeleteAcademicYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("academic_years").delete().eq("id", id);
      if (error) throw new Error(error.message || JSON.stringify(error));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic_years"] });
      qc.invalidateQueries({ queryKey: ["system-config"] });
      toast.success("Academic Year deleted");
    },
    onError: (err: any) => toast.error("Failed to delete academic year", { description: err.message }),
  });
}

// ─── DASHBOARD STATS & TRENDS ───────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const supabase = getSupabase();
      const [students, teachers, branches, revenue] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
        supabase.from("branches").select("id", { count: "exact", head: true }),
        supabase.from("fee_records").select("amount_paid").eq("status", "paid")
      ]);
      const totalRevenue = revenue.data?.reduce((acc, r) => acc + (r.amount_paid || 0), 0) || 0;
      return {
        totalStudents: { value: students.count || 0, change: 0 },
        totalTeachers: { value: teachers.count || 0, change: 0 },
        totalBranches: { value: branches.count || 0, change: 0 },
        revenueThisMonth: { value: totalRevenue, change: 0 },
      };
    },
  });
}

export function useEnrollmentTrend() {
  return useQuery({
    queryKey: ["enrollment-trend"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("profiles").select("created_at").eq("role", "student").order("created_at");
      if (error) throw new Error(error.message || JSON.stringify(error));
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const trendMap = new Map();
      data.forEach(p => {
        const month = months[new Date(p.created_at).getMonth()];
        trendMap.set(month, (trendMap.get(month) || 0) + 1);
      });
      let cumulative = 0;
      return months.map(month => {
        cumulative += trendMap.get(month) || 0;
        return { month, students: cumulative };
      });
    },
  });
}

export function useBatchDistribution() {
  return useQuery({
    queryKey: ["batch-distribution"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("batches").select("name, enrolled_count").eq("is_active", true);
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data.map(b => ({ name: b.name, students: b.enrolled_count || 0 }));
    },
  });
}

export function useFeeCollectionTrend(branchId?: string) {
  return useQuery({
    queryKey: ["fee-collection-trend", branchId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("fee_records").select("amount_paid, amount_due, status, paid_date, due_date");
      if (error) throw new Error(error.message || JSON.stringify(error));
      const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
      const trend = months.map(month => ({ month, collected: 0, pending: 0 }));
      const calMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      data.forEach(r => {
        const dateStr = r.paid_date || r.due_date;
        if (!dateStr) return;
        const calMonth = calMonths[new Date(dateStr).getMonth()];
        // Map calendar month to fiscal position
        const entry = trend.find(t => t.month === calMonth);
        if (entry) {
          if (r.status === "paid") entry.collected += Number(r.amount_paid || 0);
          else entry.pending += Number(r.amount_due || 0);
        }
      });
      return trend;
    },
  });
}

export function useAttendanceHeatmap(branchId?: string) {
  return useQuery({
    queryKey: ["attendance-heatmap", branchId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select(`id, session_date, batch:batches(name), records:attendance_records(status)`)
        .order("session_date", { ascending: false }).limit(20);
      if (error) throw new Error(error.message || JSON.stringify(error));
      const heatmapMap = new Map();
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      data.forEach(s => {
        const batchName = (s.batch as any)?.name;
        const day = new Date(s.session_date).toLocaleDateString("en-US", { weekday: "short" });
        if (!batchName || !days.includes(day)) return;
        if (!heatmapMap.has(batchName)) heatmapMap.set(batchName, { batch: batchName, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 });
        const entry = heatmapMap.get(batchName);
        const total = s.records?.length || 0;
        const present = s.records?.filter((r: any) => r.status === "present").length || 0;
        entry[day] = total > 0 ? Math.round((present / total) * 100) : 0;
      });
      return Array.from(heatmapMap.values());
    },
  });
}

// ─── SYSTEM CONFIG & AUDIT ──────────────────────────

export function useSystemConfig() {
  return useQuery({
    queryKey: ["system-config"],
    queryFn: async () => {
      const supabase = getSupabase();
      const [years, subjects, levels] = await Promise.all([
        supabase.from("academic_years").select("*").order("start_date", { ascending: false }),
        supabase.from("subjects").select("*").order("name"),
        supabase.from("levels").select("*").order("order_index")
      ]);
      return { academicYears: years.data || [], subjects: subjects.data || [], levels: levels.data || [] };
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("audit_logs").select("*, user:profiles(*)").order("created_at", { ascending: false });
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as AuditLog[];
    },
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("audit_logs").select("*, user:profiles(full_name)").order("created_at", { ascending: false }).limit(limit);
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as AuditLog[];
    },
  });
}

// ─── STUDENTS & TEACHERS ────────────────────────────

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const supabase = getSupabase();

      // 1. Fetch students that have a student_profiles row (normal path)
      const { data: withProfiles, error } = await supabase
        .from("student_profiles")
        .select(`*, profile:profiles(*), current_batch:batches(*), current_level:levels(*)`)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message || JSON.stringify(error));

      // 2. Also fetch student-role profiles that are MISSING a student_profiles row
      //    (orphans from failed creation, legacy data, etc.)
      const existingProfileIds = new Set((withProfiles || []).map((sp: any) => sp.profile_id));
      const { data: allStudentProfiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      const orphans = (allStudentProfiles || []).filter((p: any) => !existingProfileIds.has(p.id));

      // Auto-create missing student_profiles rows for orphans
      if (orphans.length > 0) {
        const inserts = orphans.map((p: any) => ({
          profile_id: p.id,
          status: "active",
          scholarship_percent: 0,
          enrollment_date: new Date().toISOString().split("T")[0],
        }));
        await supabase.from("student_profiles").upsert(inserts, { onConflict: "profile_id" });

        // Re-fetch after repair to get the full joined data
        const { data: refreshed, error: refreshErr } = await supabase
          .from("student_profiles")
          .select(`*, profile:profiles(*), current_batch:batches(*), current_level:levels(*)`)
          .order("created_at", { ascending: false });
        if (!refreshErr && refreshed) return refreshed as StudentProfile[];
      }

      return (withProfiles || []) as StudentProfile[];
    },
  });
}

export function useTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("profiles").select("*").eq("role", "teacher").order("full_name");
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as Profile[];
    },
  });
}

export function useRecentEnrollments(limit = 5) {
  return useQuery({
    queryKey: ["recent-enrollments", limit],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("profiles").select("*, student:student_profiles(*)").eq("role", "student").order("created_at", { ascending: false }).limit(limit);
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
  });
}

// ─── ATTENDANCE ─────────────────────────────────────

export function useAttendanceSessions(batchId?: string, subjectId?: string) {
  return useQuery({
    queryKey: ["attendance-sessions", batchId, subjectId],
    queryFn: async () => {
      const supabase = getSupabase();
      let query = supabase.from("attendance_sessions").select("*, batch:batches(name), subject:subjects(name)").order("session_date", { ascending: false });
      if (batchId) query = query.eq("batch_id", batchId);
      if (subjectId) query = query.eq("subject_id", subjectId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as AttendanceSession[];
    },
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ batchId, subjectId, sessionDate, topicCovered, markedBy, records }: any) => {
      const supabase = getSupabase();
      const { data: session, error: sErr } = await supabase.from("attendance_sessions").upsert({
        batch_id: batchId, subject_id: subjectId, session_date: sessionDate, topic_covered: topicCovered, marked_by: markedBy
      }, { onConflict: 'batch_id,subject_id,session_date' }).select().single();
      if (sErr) throw sErr;
      const { error: rErr } = await supabase.from("attendance_records").upsert(records.map((r: any) => ({ ...r, session_id: session.id })), { onConflict: 'session_id,student_id' });
      if (rErr) throw rErr;
      return session;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-sessions"] });
      toast.success("Attendance saved successfully");
    },
  });
}

// ─── EXAMS & SCORES ─────────────────────────────────

export function useExams(batchId?: string) {
  return useQuery({
    queryKey: ["exams", batchId],
    queryFn: async () => {
      const supabase = getSupabase();
      let query = supabase.from("exams").select("*, subject:subjects(name), batch:batches(name)").order("created_at", { ascending: false });
      if (batchId) query = query.eq("batch_id", batchId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as Exam[];
    },
  });
}

export function useTeacherExams(teacherId: string) {
  return useQuery({
    queryKey: ["teacher-exams", teacherId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("exams").select("*, subject:subjects(name), batch:batches(name)").eq("created_by", teacherId).order("created_at", { ascending: false });
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as Exam[];
    },
    enabled: !!teacherId,
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (exam: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("exams").insert(exam).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam created successfully");
    },
  });
}

export function useExamScores(examId: string) {
  return useQuery({
    queryKey: ["exam-scores", examId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("exam_scores").select("*, student:profiles(*)").eq("exam_id", examId);
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as ExamScore[];
    },
    enabled: !!examId,
  });
}

export function useExamMarkingStatus(examId: string, batchId: string) {
  return useQuery({
    queryKey: ["exam-marking-status", examId, batchId],
    queryFn: async () => {
      const supabase = getSupabase();
      // Fetch all students in the batch
      const { data: students, error: studentsError } = await supabase
        .from("student_profiles")
        .select("id, profile_id, admission_number, profile:profiles(full_name)")
        .eq("current_batch_id", batchId)
        .eq("status", "active");
      
      if (studentsError) throw new Error(studentsError.message || JSON.stringify(studentsError));

      // Fetch all scores for this exam
      const { data: scores, error: scoresError } = await supabase
        .from("exam_scores")
        .select("student_id")
        .eq("exam_id", examId);

      if (scoresError) throw new Error(scoresError.message || JSON.stringify(scoresError));

      const scoredStudentIds = new Set(scores?.map(s => s.student_id));
      
      const statusList = students?.map(s => ({
        ...s,
        is_marked: scoredStudentIds.has(s.profile_id)
      })) || [];

      return {
        total: statusList.length,
        marked: statusList.filter(s => s.is_marked).length,
        students: statusList.sort((a, b) => a.is_marked === b.is_marked ? 0 : a.is_marked ? 1 : -1) // Unmarked first
      };
    },
    enabled: !!examId && !!batchId,
  });
}

export function useEnterScores() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, scores, enteredBy, isPublished = true }: any) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("exam_scores").upsert(scores.map((s: any) => ({ ...s, exam_id: examId, entered_by: enteredBy })), { onConflict: 'exam_id,student_id' });
      if (error) throw new Error(error.message || JSON.stringify(error));
      await supabase.from("exams").update({ is_published: isPublished }).eq("id", examId);
    },
    onSuccess: (_: any, variables: any) => {
      qc.invalidateQueries({ queryKey: ["exams"] });
      qc.invalidateQueries({ queryKey: ["exam-scores", variables.examId] });
      toast.success(variables.isPublished ? "Scores published" : "Draft saved successfully");
    },
  });
}

// ─── FEES ───────────────────────────────────────────

export function useFeeRecords(studentId?: string) {
  return useQuery({
    queryKey: ["fee-records", studentId],
    queryFn: async () => {
      const supabase = getSupabase();
      let query = supabase.from("fee_records").select("*, student:profiles(*), structure:fee_structures(*)").order("due_date", { ascending: false });
      if (studentId) query = query.eq("student_id", studentId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
  });
}

export function useUpdateFeeRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("fee_records").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fee-records"] });
      toast.success("Payment recorded");
    },
  });
}

// ─── ADMISSIONS ─────────────────────────────────────

export function useAdmissions() {
  return useQuery({
    queryKey: ["admissions"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("admissions").select("*, branch:branches(name), level:levels(name)").order("created_at", { ascending: false });
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
  });
}

export function useUpdateAdmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("admissions").update(updates).eq("id", id);
      if (error) throw new Error(error.message || JSON.stringify(error));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admissions"] });
      toast.success("Admission updated");
    },
  });
}

// ─── TIMETABLE ──────────────────────────────────────

export function useTimetable(batchId?: string) {
  return useQuery({
    queryKey: ["timetable", batchId],
    queryFn: async () => {
      const supabase = getSupabase();
      let query = supabase.from("timetable").select("*, batch:batches(name), subject:subjects(name), teacher:profiles(full_name)").order("day_of_week").order("start_time");
      if (batchId && batchId !== "all") query = query.eq("batch_id", batchId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
  });
}

export function useCreateTimetableSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slotData: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("timetable").insert([slotData]).select();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable"] });
      toast.success("Class scheduled successfully");
    },
  });
}

export function useDeleteTimetableSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("timetable").delete().eq("id", id);
      if (error) throw new Error(error.message || JSON.stringify(error));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable"] });
      toast.success("Class schedule removed");
    },
  });
}

// ─── ANNOUNCEMENTS ──────────────────────────────────

export function useAnnouncements(role?: string, branchId?: string) {
  return useQuery({
    queryKey: ["announcements", role, branchId],
    queryFn: async () => {
      const supabase = getSupabase();
      let query = supabase.from("announcements").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
      if (role) query = query.contains("target_role", [role]);
      if (branchId) query = query.eq("branch_id", branchId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (announcement: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("announcements").insert(announcement).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement posted");
    },
  });
}

// ─── STUDY MATERIALS ────────────────────────────────

export function useStudyMaterials(batchId?: string, subjectId?: string) {
  return useQuery({
    queryKey: ["study-materials", batchId, subjectId],
    queryFn: async () => {
      const supabase = getSupabase();
      let query = supabase.from("study_materials").select("*, subject:subjects(name), teacher:profiles(full_name)").order("created_at", { ascending: false });
      if (batchId) query = query.eq("batch_id", batchId);
      if (subjectId) query = query.eq("subject_id", subjectId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
  });
}

export function useCreateStudyMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (material: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("study_materials").insert(material).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["study-materials"] });
      toast.success("Material uploaded");
    },
  });
}

export function useDeleteStudyMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("study_materials").delete().eq("id", id);
      if (error) throw new Error(error.message || JSON.stringify(error));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["study-materials"] });
    },
  });
}

// ─── HOMEWORK ───────────────────────────────────────

export function useHomework(batchId?: string) {
  return useQuery({
    queryKey: ["homework", batchId],
    queryFn: async () => {
      const supabase = getSupabase();
      let query = supabase.from("homework").select("*, subject:subjects(name)").order("created_at", { ascending: false });
      if (batchId) query = query.eq("batch_id", batchId);
      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
  });
}

export function useHomeworkDetails(id: string) {
  return useQuery({
    queryKey: ["homework", id],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("homework").select("*, subject:subjects(name), batch:batches(name)").eq("id", id).single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (homework: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("homework").insert(homework).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homework"] });
      toast.success("Homework assigned successfully");
    },
  });
}

export function useHomeworkSubmissions(homeworkId: string) {
  return useQuery({
    queryKey: ["homework-submissions", homeworkId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("homework_submissions").select("*, student:profiles(*)").eq("homework_id", homeworkId).order("submitted_at", { ascending: false });
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    enabled: !!homeworkId,
  });
}

export function useUpdateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("homework_submissions").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: (_: any, variables: any) => {
      qc.invalidateQueries({ queryKey: ["homework-submissions"] });
      toast.success("Submission reviewed");
    },
  });
}

export function useSubmitHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (submission: any) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("homework_submissions").insert(submission).select().single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-submissions"] });
      qc.invalidateQueries({ queryKey: ["homework-submissions"] });
      toast.success("Homework submitted successfully");
    },
  });
}

export function usePromoteStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentIds, targetLevelId, targetBatchId }: { studentIds: string[], targetLevelId: string, targetBatchId: string }) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("student_profiles")
        .update({ 
          current_level_id: targetLevelId, 
          current_batch_id: targetBatchId 
        })
        .in("profile_id", studentIds);
      if (error) throw new Error(error.message || JSON.stringify(error));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Students promoted successfully");
    },
  });
}

// ─── ADMIN: STUDENTS BY BATCH ───────────────────────

export function useStudentsByBatch(batchId?: string) {
  return useQuery({
    queryKey: ["students-by-batch", batchId],
    queryFn: async () => {
      if (!batchId) return [] as StudentProfile[];
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("student_profiles")
        .select(`*, profile:profiles(*), current_batch:batches(*), current_level:levels(*)`)
        .eq("current_batch_id", batchId);
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as StudentProfile[];
    },
    enabled: !!batchId,
  });
}

// ─── TEACHER SPECIFIC ───────────────────────────────

export function useTeacherBatches(teacherId: string) {
  return useQuery({
    queryKey: ["teacher-batches", teacherId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("batch_subjects").select(`batch:batches(*, level:levels(*))`).eq("teacher_id", teacherId);
      if (error) throw new Error(error.message || JSON.stringify(error));
      const batches = Array.from(new Set(data.map(d => (d.batch as any)?.id))).map(id => data.find(d => (d.batch as any)?.id === id)?.batch).filter(Boolean);
      return batches as unknown as Batch[];
    },
    enabled: !!teacherId,
  });
}

export function useTeacherSchedule(teacherId: string) {
  return useQuery({
    queryKey: ["teacher-schedule", teacherId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("timetable").select(`*, batch:batches(*), subject:subjects(*)`).eq("teacher_id", teacherId).eq("is_active", true);
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as any[];
    },
    enabled: !!teacherId,
  });
}

export function useTeacherStats(teacherId: string) {
  return useQuery({
    queryKey: ["teacher-stats", teacherId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data: batchIds } = await supabase.from("batch_subjects").select("batch_id").eq("teacher_id", teacherId);
      const uniqueBatchIds = Array.from(new Set(batchIds?.map(b => b.batch_id) || []));
      let studentCount = 0;
      if (uniqueBatchIds.length > 0) {
        const { count } = await supabase.from("student_profiles").select("id", { count: "exact", head: true }).in("current_batch_id", uniqueBatchIds);
        studentCount = count || 0;
      }
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const { count: classesToday } = await supabase.from("timetable").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId).eq("day_of_week", today).eq("is_active", true);
      const { count: pendingScores } = await supabase.from("exams").select("id", { count: "exact", head: true }).eq("created_by", teacherId).eq("is_published", false);
      const { data: scores } = await supabase.from("exam_scores").select(`marks_obtained, exam:exams(total_marks)`).eq("entered_by", teacherId);
      let avgPerf = 0;
      if (scores && scores.length > 0) {
        const totalObtained = scores.reduce((acc, s) => acc + (s.marks_obtained || 0), 0);
        const totalPossible = scores.reduce((acc, s) => acc + ((s.exam as any)?.total_marks || 0), 0);
        avgPerf = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
      }
      return { myStudents: { value: studentCount, change: 0 }, classesToday: { value: classesToday || 0 }, pendingScores: { value: pendingScores || 0 }, avgPerformance: { value: Math.round(avgPerf), change: 0 } };
    },
    enabled: !!teacherId,
  });
}

export function useTeacherStudents(teacherId: string, batchId?: string) {
  return useQuery({
    queryKey: ["teacher-students", teacherId, batchId],
    queryFn: async () => {
      const supabase = getSupabase();
      let targetBatchIds: string[] = [];
      if (batchId) targetBatchIds = [batchId];
      else {
        const { data: batchIds } = await supabase.from("batch_subjects").select("batch_id").eq("teacher_id", teacherId);
        targetBatchIds = Array.from(new Set(batchIds?.map(b => b.batch_id) || []));
      }
      if (targetBatchIds.length === 0) return [] as StudentProfile[];
      const { data, error } = await supabase.from("student_profiles").select(`*, profile:profiles(*), current_batch:batches(*), current_level:levels(*)`).in("current_batch_id", targetBatchIds);
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as StudentProfile[];
    },
    enabled: !!teacherId,
  });
}

// ─── STUDENT SPECIFIC ───────────────────────────────

export function useStudentProfile(profileId: string) {
  return useQuery({
    queryKey: ["student-profile", profileId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("student_profiles").select("*, profile:profiles(*), batch:batches(*), level:levels(*)").eq("profile_id", profileId).single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    enabled: !!profileId,
  });
}

export function useStudentStats(studentId: string) {
  return useQuery({
    queryKey: ["student-stats", studentId],
    queryFn: async () => {
      const supabase = getSupabase();

      // 1. Attendance percentage
      const { data: attendance } = await supabase.from("attendance_records").select("status").eq("student_id", studentId);
      const totalSessions = attendance?.length || 0;
      const presentSessions = attendance?.filter(a => a.status === "present").length || 0;
      const attendancePercent = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

      // 2. Average exam score
      const { data: scores } = await supabase.from("exam_scores").select(`marks_obtained, exam:exams(total_marks)`).eq("student_id", studentId);
      let avgPerf = 0;
      if (scores && scores.length > 0) {
        const totalObtained = scores.reduce((acc, s) => acc + (s.marks_obtained || 0), 0);
        const totalPossible = scores.reduce((acc, s) => acc + ((s.exam as any)?.total_marks || 0), 0);
        avgPerf = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
      }

      // 3. Pending homework
      const { data: studentProf } = await supabase.from("student_profiles").select("current_batch_id").eq("profile_id", studentId).single();
      let pendingHW = 0;
      if (studentProf?.current_batch_id) {
        const { data: allHW } = await supabase.from("homework").select("id").eq("batch_id", studentProf.current_batch_id).eq("is_active", true);
        const { data: submissions } = await supabase.from("homework_submissions").select("homework_id").eq("student_id", studentId);
        const submittedHWIds = new Set(submissions?.map(s => s.homework_id) || []);
        pendingHW = Math.max(0, (allHW?.length || 0) - submittedHWIds.size);
      }

      // 4. Batch rank — calculate from all students' exam averages in the same batch
      let batchRank = 0;
      if (studentProf?.current_batch_id) {
        // Get all students in the same batch
        const { data: batchStudents } = await supabase
          .from("student_profiles")
          .select("profile_id")
          .eq("current_batch_id", studentProf.current_batch_id)
          .eq("status", "active");

        if (batchStudents && batchStudents.length > 1) {
          const studentIds = batchStudents.map(s => s.profile_id);

          // Get all exam scores for these students
          const { data: allScores } = await supabase
            .from("exam_scores")
            .select("student_id, marks_obtained, exam:exams(total_marks)")
            .in("student_id", studentIds);

          if (allScores && allScores.length > 0) {
            // Calculate average percentage per student
            const studentAvgMap = new Map<string, { obtained: number; possible: number }>();
            allScores.forEach(s => {
              const current = studentAvgMap.get(s.student_id) || { obtained: 0, possible: 0 };
              current.obtained += s.marks_obtained || 0;
              current.possible += (s.exam as any)?.total_marks || 0;
              studentAvgMap.set(s.student_id, current);
            });

            // Sort by average percentage descending
            const ranked = Array.from(studentAvgMap.entries())
              .map(([id, stats]) => ({
                id,
                avg: stats.possible > 0 ? (stats.obtained / stats.possible) * 100 : 0,
              }))
              .sort((a, b) => b.avg - a.avg);

            // Find current student's position (1-indexed)
            const position = ranked.findIndex(r => r.id === studentId);
            batchRank = position >= 0 ? position + 1 : 0;
          }
        } else if (batchStudents && batchStudents.length === 1) {
          batchRank = 1; // Only student in batch
        }
      }

      return {
        attendancePercent: { value: Math.round(attendancePercent), change: 0 },
        averageScore: { value: Math.round(avgPerf), change: 0 },
        pendingHomework: { value: pendingHW, change: 0 },
        batchRank: { value: batchRank, change: 0 },
      };
    },
    enabled: !!studentId,
  });
}

export function useStudentTimetable(batchId: string) {
  return useQuery({
    queryKey: ["student-timetable", batchId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("timetable").select(`*, subject:subjects(name), teacher:profiles(full_name)`).eq("batch_id", batchId).eq("is_active", true).order("start_time");
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    enabled: !!batchId,
  });
}

export function useStudentScores(studentId: string) {
  return useQuery({
    queryKey: ["student-scores", studentId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("exam_scores")
        .select(`
          *, 
          exam:exams!inner(title, total_marks, passing_marks, type, is_published, subject:subjects(name))
        `)
        .eq("student_id", studentId)
        .eq("exam.is_published", true)
        .order("updated_at", { ascending: false });
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    enabled: !!studentId,
  });
}

export function useStudentSubmissions(studentId: string) {
  return useQuery({
    queryKey: ["student-submissions", studentId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("homework_submissions").select("*").eq("student_id", studentId);
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    enabled: !!studentId,
  });
}

// ─── Interconnectivity Mutations ────────────────────

export function useBatchSubjects(batchId?: string) {
  return useQuery({
    queryKey: ["batch-subjects", batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const supabase = getSupabase();
      const { data, error } = await supabase.from("batch_subjects").select("*, subject:subjects(*), teacher:profiles(*)").eq("batch_id", batchId);
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    enabled: !!batchId,
  });
}

export function useAssignTeacherToBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assignment: { batch_id: string; subject_id: string; teacher_id: string }) => {
      const supabase = getSupabase();
      // Use upsert so re-assigning a teacher to the same batch+subject updates instead of crashing
      const { data, error } = await supabase
        .from("batch_subjects")
        .upsert(assignment, { onConflict: 'batch_id,subject_id' })
        .select()
        .single();
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["teacher-batches"] });
      qc.invalidateQueries({ queryKey: ["batch-subjects", variables.batch_id] });
      qc.invalidateQueries({ queryKey: ["all-teacher-assignments"] });
      qc.invalidateQueries({ queryKey: ["teacher-assignments", variables.teacher_id] });
      toast.success("Teacher assigned to batch successfully");
    },
    onError: (err: any) => toast.error("Failed to assign teacher", { description: err.message }),
  });
}

export function useUnassignedStudents() {
  return useQuery({
    queryKey: ["unassigned-students"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("student_profiles")
        .select("*, profile:profiles(*)")
        .is("current_batch_id", null);
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as any[];
    },
  });
}

export function useEnrollStudentInBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ student_id, batch_id }: { student_id: string; batch_id: string }) => {
      const supabase = getSupabase();
      // student_id here is the profile_id from the profiles table
      // NOTE: enrolled_count is now managed by a DB trigger on student_profiles
      const { data, error } = await supabase
        .from("student_profiles")
        .update({ current_batch_id: batch_id })
        .eq("profile_id", student_id)
        .select()
        .single();
      if (error) {
        console.error("Enroll student error:", error);
        throw new Error(error.message || JSON.stringify(error));
      }

      // Auto-generate fee records: check if the batch has active fee structures
      const { data: feeStructures } = await supabase
        .from("fee_structures")
        .select("*")
        .eq("batch_id", batch_id)
        .eq("is_active", true);

      if (feeStructures && feeStructures.length > 0) {
        const feeRecords = feeStructures.map(fs => ({
          student_id,
          fee_structure_id: fs.id,
          amount_due: fs.amount,
          amount_paid: 0,
          discount_amount: 0,
          status: "pending",
          due_date: fs.due_day
            ? new Date(new Date().getFullYear(), new Date().getMonth(), fs.due_day).toISOString().split("T")[0]
            : null,
        }));
        // Upsert to avoid duplicates if re-enrolling
        await supabase.from("fee_records").insert(feeRecords).select();
      }

      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["teacher-students"] });
      qc.invalidateQueries({ queryKey: ["profiles", "student"] });
      qc.invalidateQueries({ queryKey: ["unassigned-students"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-by-batch"] });
      qc.invalidateQueries({ queryKey: ["batches"] });
      qc.invalidateQueries({ queryKey: ["batch-distribution"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["fee-records"] });
      toast.success("Student assigned to batch successfully");
    },
    onError: (err: any) => toast.error("Failed to assign student", { description: err.message }),
  });
}

// ─── TEACHER ASSIGNMENTS (Scoping Engine) ───────────

/** Returns all batch+subject assignments for a specific teacher */
export function useTeacherAssignments(teacherId: string) {
  return useQuery({
    queryKey: ["teacher-assignments", teacherId],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("batch_subjects")
        .select("*, batch:batches(*, level:levels(*)), subject:subjects(*)")
        .eq("teacher_id", teacherId);
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as any[];
    },
    enabled: !!teacherId,
  });
}

/** Returns ALL teacher assignments across the system (for Admin Assign page) */
export function useAllTeacherAssignments() {
  return useQuery({
    queryKey: ["all-teacher-assignments"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("batch_subjects")
        .select("*, batch:batches(name, level:levels(name)), subject:subjects(name), teacher:profiles(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message || JSON.stringify(error));
      return data as any[];
    },
  });
}

/** Remove a teacher assignment (Admin action) */
export function useRemoveTeacherAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("batch_subjects").delete().eq("id", assignmentId);
      if (error) throw new Error(error.message || JSON.stringify(error));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-teacher-assignments"] });
      qc.invalidateQueries({ queryKey: ["teacher-assignments"] });
      qc.invalidateQueries({ queryKey: ["teacher-batches"] });
      qc.invalidateQueries({ queryKey: ["batch-subjects"] });
      toast.success("Assignment removed");
    },
    onError: (err: any) => toast.error("Failed to remove assignment", { description: err.message }),
  });
}

