// PrepXIQ ERP — TypeScript Type Definitions

import type { UserRole } from "./constants";

// ─── Auth & Profiles ────────────────────────────────
export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  branch_id?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: Profile | null;
  loading: boolean;
  initialized: boolean;
}

// ─── Branches ───────────────────────────────────────
export interface Branch {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

// ─── Academic ───────────────────────────────────────
export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  branch_id?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  branch_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Level {
  id: string;
  name: string;
  description?: string;
  order_index?: number;
  min_score_to_promote?: number;
  branch_id?: string;
  created_at: string;
}

// ─── Batches ────────────────────────────────────────
export interface Batch {
  id: string;
  name: string;
  code?: string;
  level_id?: string;
  branch_id?: string;
  academic_year_id?: string;
  capacity: number;
  enrolled_count: number;
  start_date?: string;
  end_date?: string;
  schedule_days?: string[];
  start_time?: string;
  end_time?: string;
  room_number?: string;
  is_active: boolean;
  created_at: string;
  // Joined
  level?: Level;
  branch?: Branch;
  academic_year?: AcademicYear;
}

export interface BatchSubject {
  id: string;
  batch_id: string;
  subject_id: string;
  teacher_id?: string;
  created_at: string;
  // Joined
  subject?: Subject;
  teacher?: Profile;
}

// ─── Students ───────────────────────────────────────
export interface StudentProfile {
  id: string;
  profile_id: string;
  admission_number?: string;
  enrollment_date?: string;
  current_level_id?: string;
  current_batch_id?: string;
  school_name?: string;
  class_in_school?: string;
  father_name?: string;
  mother_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  emergency_contact?: string;
  medical_notes?: string;
  referral_source?: string;
  status: "active" | "inactive" | "graduated" | "dropped";
  scholarship_percent: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  // Joined
  profile?: Profile;
  current_level?: Level;
  current_batch?: Batch;
}

// ─── Teachers ───────────────────────────────────────
export interface TeacherProfile {
  id: string;
  profile_id: string;
  employee_id?: string;
  qualification?: string;
  specialization?: string;
  experience_years?: number;
  joining_date?: string;
  salary?: number;
  status: "active" | "inactive" | "on_leave";
  created_at: string;
  // Joined
  profile?: Profile;
}

// ─── Admissions ─────────────────────────────────────
export interface Admission {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  date_of_birth?: string;
  school_name?: string;
  class_in_school?: string;
  desired_level_id?: string;
  branch_id?: string;
  source?: string;
  status: "pending" | "contacted" | "enrolled" | "rejected" | "waitlisted";
  notes?: string;
  follow_up_date?: string;
  converted_student_id?: string;
  created_at: string;
  updated_at: string;
}

// ─── Attendance ─────────────────────────────────────
export interface AttendanceSession {
  id: string;
  batch_id: string;
  subject_id?: string;
  teacher_id?: string;
  session_date: string;
  start_time?: string;
  end_time?: string;
  topic_covered?: string;
  notes?: string;
  created_at: string;
  // Joined
  batch?: Batch;
  subject?: Subject;
  teacher?: Profile;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
  marked_by?: string;
  marked_at: string;
  // Joined
  student?: Profile;
}

// ─── Exams ──────────────────────────────────────────
export interface Exam {
  id: string;
  title: string;
  type: "exam" | "mock_test" | "quiz" | "assignment" | "class_test";
  subject_id?: string;
  batch_id?: string;
  academic_year_id?: string;
  exam_date?: string;
  total_marks: number;
  passing_marks?: number;
  duration_minutes?: number;
  instructions?: string;
  created_by?: string;
  is_published: boolean;
  created_at: string;
  // Joined
  subject?: Subject;
  batch?: Batch;
}

export interface ExamScore {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained?: number;
  grade?: string;
  rank_in_batch?: number;
  is_absent: boolean;
  remarks?: string;
  entered_by?: string;
  entered_at: string;
  updated_at: string;
  // Joined
  student?: Profile;
  exam?: Exam;
}

// ─── Fees ───────────────────────────────────────────
export interface FeeStructure {
  id: string;
  name: string;
  batch_id?: string;
  level_id?: string;
  amount: number;
  frequency?: "monthly" | "quarterly" | "annual" | "one_time";
  due_day?: number;
  late_fee: number;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface FeeRecord {
  id: string;
  student_id: string;
  fee_structure_id?: string;
  amount_due: number;
  amount_paid: number;
  discount_amount: number;
  discount_reason?: string;
  due_date?: string;
  paid_date?: string;
  payment_method?: "cash" | "upi" | "bank_transfer" | "cheque" | "online";
  transaction_id?: string;
  receipt_number?: string;
  status: "pending" | "partial" | "paid" | "overdue" | "waived";
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  student?: Profile;
  fee_structure?: FeeStructure;
}

// ─── Study Materials ────────────────────────────────
export interface StudyMaterial {
  id: string;
  title: string;
  description?: string;
  type?: "pdf" | "video" | "link" | "image" | "doc" | "other";
  file_url?: string;
  external_url?: string;
  subject_id?: string;
  batch_id?: string;
  uploaded_by?: string;
  is_published: boolean;
  created_at: string;
}

// ─── Homework ───────────────────────────────────────
export interface Homework {
  id: string;
  title: string;
  description?: string;
  subject_id?: string;
  batch_id?: string;
  assigned_by?: string;
  due_date?: string;
  max_marks?: number;
  attachment_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  submission_url?: string;
  submitted_at: string;
  marks_given?: number;
  feedback?: string;
  status: "submitted" | "reviewed" | "late";
}

// ─── Announcements ─────────────────────────────────
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type?: "general" | "urgent" | "event" | "holiday" | "exam";
  target_role?: string[];
  target_batch_ids?: string[];
  branch_id?: string;
  is_pinned: boolean;
  published_by?: string;
  publish_at: string;
  expires_at?: string;
  created_at: string;
}

// ─── Timetable ──────────────────────────────────────
export interface TimetableSlot {
  id: string;
  batch_id: string;
  subject_id?: string;
  teacher_id?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_number?: string;
  effective_from?: string;
  effective_until?: string;
  is_active: boolean;
  // Joined
  batch?: Batch;
  subject?: Subject;
  teacher?: Profile;
}

// ─── Notifications ──────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  type?: "info" | "success" | "warning" | "error" | "fee" | "attendance" | "exam" | "announcement";
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// ─── Audit Logs ─────────────────────────────────────
export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  // Joined
  user?: Profile;
}

// ─── UI Types ───────────────────────────────────────
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface StatCardData {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "up" | "down";
  icon: string;
  color?: string;
}
