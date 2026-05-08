// PrepXIQ ERP — Design Tokens & Constants

export const APP_NAME = "PrepXIQ ERP";
export const APP_TAGLINE = "Where Learning Meets Excellence";

// Role definitions
export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  CLASS_MANAGER: "class_manager",
  TEACHER: "teacher",
  STUDENT: "student",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// Role display names
export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  class_manager: "Class Manager",
  teacher: "Teacher",
  student: "Student",
};

// Role colors for badges
export const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  admin: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  class_manager: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  teacher: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  student: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

// Role dashboard routes
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  superadmin: "/superadmin",
  admin: "/admin",
  class_manager: "/class-manager",
  teacher: "/teacher",
  student: "/student",
};

// Status variants
export const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  inactive: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  graduated: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  dropped: "bg-red-500/15 text-red-400 border-red-500/20",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  partial: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  overdue: "bg-red-500/15 text-red-400 border-red-500/20",
  waived: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  present: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  absent: "bg-red-500/15 text-red-400 border-red-500/20",
  late: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  excused: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  on_leave: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  submitted: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  reviewed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  enrolled: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  contacted: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  waitlisted: "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

// Attendance thresholds
export const ATTENDANCE_THRESHOLDS = {
  GOOD: 75,
  WARNING: 60,
} as const;

// Fee payment methods
export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "online", label: "Online" },
] as const;

// Exam types
export const EXAM_TYPES = [
  { value: "exam", label: "Exam" },
  { value: "mock_test", label: "Mock Test" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
  { value: "class_test", label: "Class Test" },
] as const;

// Announcement types
export const ANNOUNCEMENT_TYPES = [
  { value: "general", label: "General" },
  { value: "urgent", label: "Urgent" },
  { value: "event", label: "Event" },
  { value: "holiday", label: "Holiday" },
  { value: "exam", label: "Exam" },
] as const;

// Days of week
export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Debounce
export const SEARCH_DEBOUNCE_MS = 300;

// File upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
