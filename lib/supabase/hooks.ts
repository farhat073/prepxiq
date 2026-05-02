"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Branch, Subject, Level, Batch, AcademicYear } from "@/lib/types";
import { toast } from "sonner";

// Create client lazily inside each hook — NOT at module scope.
// Module-scope init can run during SSR where fetch() isn't available.
function getSupabase() {
  return createClient();
}

// ─── PROFILES ───────────────────────────────────────

export function useProfiles(roleFilter?: string) {
  return useQuery({
    queryKey: ["profiles", roleFilter],
    queryFn: async () => {
      const supabase = getSupabase();
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (roleFilter) query = query.eq("role", roleFilter);
      const { data, error } = await query;
      if (error) throw error;
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
      if (error) throw error;
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
      if (error) throw error;
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
      if (error) throw error;
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
      if (error) throw error;
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
      if (error) throw error;
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
      if (error) throw error;
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
      if (error) throw error;
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
      const { data, error } = await supabase.from("subjects").select("*").order("name");
      if (error) throw error;
      return data as Subject[];
    },
  });
}

// ─── LEVELS ─────────────────────────────────────────

export function useLevels() {
  return useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("levels").select("*").order("order_index");
      if (error) throw error;
      return data as Level[];
    },
  });
}

// ─── BATCHES ────────────────────────────────────────

export function useBatches() {
  return useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("batches").select("*, level:levels(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Batch[];
    },
  });
}

// ─── ACADEMIC YEARS ─────────────────────────────────

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic_years"],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("academic_years").select("*").order("start_date", { ascending: false });
      if (error) throw error;
      return data as AcademicYear[];
    },
  });
}

// ─── STUDENT PROFILES ───────────────────────────────

export function useCreateStudentProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (studentProfile: Record<string, any>) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("student_profiles").insert(studentProfile).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Student enrolled successfully");
    },
    onError: (err: any) => toast.error("Failed to enroll student", { description: err.message }),
  });
}

// ─── DASHBOARD STATS ────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const supabase = getSupabase();
      const [students, teachers, branches, profiles] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
        supabase.from("branches").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return {
        totalStudents: students.count || 0,
        totalTeachers: teachers.count || 0,
        totalBranches: branches.count || 0,
        totalUsers: profiles.count || 0,
      };
    },
  });
}
