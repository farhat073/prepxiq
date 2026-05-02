// Demo/Mock data for development without Supabase
import type { Profile, Branch, AcademicYear, Subject, Level, Batch, StudentProfile, TeacherProfile, Exam, ExamScore, FeeRecord, AttendanceSession, AttendanceRecord, Announcement, Notification, AuditLog } from "./types";

// ─── Branches ───────────────────────────────────────
export const demoBranches: Branch[] = [
  { id: "b1", name: "Main Center", address: "123 Education Lane", city: "Srinagar", state: "J&K", pincode: "190001", phone: "9876543210", email: "main@prepxiq.com", is_active: true, created_at: "2024-01-01" },
];

// ─── Academic Years ─────────────────────────────────
export const demoAcademicYears: AcademicYear[] = [
  { id: "ay1", name: "2024-25", start_date: "2024-04-01", end_date: "2025-03-31", is_current: true, branch_id: "b1", created_at: "2024-01-01" },
];

// ─── Subjects ───────────────────────────────────────
export const demoSubjects: Subject[] = [
  { id: "s1", name: "Physics", code: "PHY", description: "Physics for competitive exams", branch_id: "b1", is_active: true, created_at: "2024-01-01" },
  { id: "s2", name: "Chemistry", code: "CHM", description: "Chemistry for competitive exams", branch_id: "b1", is_active: true, created_at: "2024-01-01" },
  { id: "s3", name: "Mathematics", code: "MTH", description: "Mathematics for competitive exams", branch_id: "b1", is_active: true, created_at: "2024-01-01" },
  { id: "s4", name: "Biology", code: "BIO", description: "Biology for NEET preparation", branch_id: "b1", is_active: true, created_at: "2024-01-01" },
];

// ─── Levels ─────────────────────────────────────────
export const demoLevels: Level[] = [
  { id: "l1", name: "Foundation", description: "Class 8-10 basics", order_index: 1, min_score_to_promote: 60, branch_id: "b1", created_at: "2024-01-01" },
  { id: "l2", name: "Intermediate", description: "Class 11-12", order_index: 2, min_score_to_promote: 65, branch_id: "b1", created_at: "2024-01-01" },
  { id: "l3", name: "Advanced", description: "Advanced competitive prep", order_index: 3, min_score_to_promote: 70, branch_id: "b1", created_at: "2024-01-01" },
  { id: "l4", name: "JEE Mains", description: "JEE Mains targeted", order_index: 4, min_score_to_promote: 75, branch_id: "b1", created_at: "2024-01-01" },
  { id: "l5", name: "JEE Advanced", description: "JEE Advanced targeted", order_index: 5, min_score_to_promote: 80, branch_id: "b1", created_at: "2024-01-01" },
];

// ─── Profiles (Users) ───────────────────────────────
export const demoProfiles: Profile[] = [
  { id: "u1", role: "superadmin", full_name: "Arif Khan", email: "superadmin@prepxiq.com", phone: "9876543001", is_active: true, branch_id: "b1", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "u2", role: "admin", full_name: "Sana Malik", email: "admin@prepxiq.com", phone: "9876543002", is_active: true, branch_id: "b1", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "u3", role: "teacher", full_name: "Dr. Ravi Sharma", email: "teacher1@prepxiq.com", phone: "9876543003", is_active: true, branch_id: "b1", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "u4", role: "teacher", full_name: "Priya Gupta", email: "teacher2@prepxiq.com", phone: "9876543004", is_active: true, branch_id: "b1", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "u5", role: "teacher", full_name: "Mohd. Faisal", email: "teacher3@prepxiq.com", phone: "9876543005", is_active: true, branch_id: "b1", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "u6", role: "student", full_name: "Aarav Patel", email: "student1@prepxiq.com", phone: "9876543010", is_active: true, branch_id: "b1", gender: "male", created_at: "2024-02-01", updated_at: "2024-02-01" },
  { id: "u7", role: "student", full_name: "Diya Sharma", email: "student2@prepxiq.com", phone: "9876543011", is_active: true, branch_id: "b1", gender: "female", created_at: "2024-02-01", updated_at: "2024-02-01" },
  { id: "u8", role: "student", full_name: "Arjun Singh", email: "student3@prepxiq.com", phone: "9876543012", is_active: true, branch_id: "b1", gender: "male", created_at: "2024-02-15", updated_at: "2024-02-15" },
  { id: "u9", role: "student", full_name: "Meera Nair", email: "student4@prepxiq.com", phone: "9876543013", is_active: true, branch_id: "b1", gender: "female", created_at: "2024-03-01", updated_at: "2024-03-01" },
  { id: "u10", role: "student", full_name: "Kabir Hussain", email: "student5@prepxiq.com", phone: "9876543014", is_active: true, branch_id: "b1", gender: "male", created_at: "2024-03-01", updated_at: "2024-03-01" },
  { id: "u11", role: "student", full_name: "Ananya Reddy", email: "student6@prepxiq.com", phone: "9876543015", is_active: true, branch_id: "b1", gender: "female", created_at: "2024-03-15", updated_at: "2024-03-15" },
  { id: "u12", role: "student", full_name: "Rohan Das", email: "student7@prepxiq.com", phone: "9876543016", is_active: true, branch_id: "b1", gender: "male", created_at: "2024-04-01", updated_at: "2024-04-01" },
  { id: "u13", role: "student", full_name: "Ishaan Verma", email: "student8@prepxiq.com", phone: "9876543017", is_active: true, branch_id: "b1", gender: "male", created_at: "2024-04-01", updated_at: "2024-04-01" },
  { id: "u14", role: "student", full_name: "Zara Khan", email: "student9@prepxiq.com", phone: "9876543018", is_active: true, branch_id: "b1", gender: "female", created_at: "2024-04-15", updated_at: "2024-04-15" },
  { id: "u15", role: "student", full_name: "Vivaan Joshi", email: "student10@prepxiq.com", phone: "9876543019", is_active: true, branch_id: "b1", gender: "male", created_at: "2024-05-01", updated_at: "2024-05-01" },
];

// ─── Batches ────────────────────────────────────────
export const demoBatches: Batch[] = [
  { id: "bt1", name: "Foundation Alpha", code: "FND-A", level_id: "l1", branch_id: "b1", academic_year_id: "ay1", capacity: 30, enrolled_count: 4, start_date: "2024-04-01", schedule_days: ["monday", "wednesday", "friday"], start_time: "09:00", end_time: "11:00", room_number: "R-101", is_active: true, created_at: "2024-01-01", level: demoLevels[0] },
  { id: "bt2", name: "JEE Mains Batch A", code: "JEE-A", level_id: "l4", branch_id: "b1", academic_year_id: "ay1", capacity: 25, enrolled_count: 4, start_date: "2024-04-01", schedule_days: ["tuesday", "thursday", "saturday"], start_time: "14:00", end_time: "17:00", room_number: "R-201", is_active: true, created_at: "2024-01-01", level: demoLevels[3] },
  { id: "bt3", name: "NEET Warriors", code: "NEET-W", level_id: "l3", branch_id: "b1", academic_year_id: "ay1", capacity: 30, enrolled_count: 2, start_date: "2024-04-01", schedule_days: ["monday", "wednesday", "friday"], start_time: "14:00", end_time: "17:00", room_number: "R-301", is_active: true, created_at: "2024-01-01", level: demoLevels[2] },
];

// ─── Exams ──────────────────────────────────────────
export const demoExams: Exam[] = [
  { id: "e1", title: "Physics Mid-Term", type: "exam", subject_id: "s1", batch_id: "bt1", exam_date: "2024-08-15", total_marks: 100, passing_marks: 35, duration_minutes: 180, is_published: true, created_at: "2024-08-01" },
  { id: "e2", title: "Chemistry Quiz 1", type: "quiz", subject_id: "s2", batch_id: "bt2", exam_date: "2024-08-20", total_marks: 50, passing_marks: 20, duration_minutes: 45, is_published: true, created_at: "2024-08-10" },
  { id: "e3", title: "Maths Mock Test", type: "mock_test", subject_id: "s3", batch_id: "bt1", exam_date: "2024-09-01", total_marks: 100, passing_marks: 40, duration_minutes: 120, is_published: true, created_at: "2024-08-20" },
  { id: "e4", title: "Biology Class Test", type: "class_test", subject_id: "s4", batch_id: "bt3", exam_date: "2024-09-10", total_marks: 30, passing_marks: 12, duration_minutes: 30, is_published: true, created_at: "2024-09-01" },
];

// ─── Fee Records ────────────────────────────────────
export const demoFeeRecords: FeeRecord[] = [
  { id: "f1", student_id: "u6", amount_due: 15000, amount_paid: 15000, discount_amount: 0, due_date: "2024-04-05", paid_date: "2024-04-03", payment_method: "upi", status: "paid", receipt_number: "REC-001", created_at: "2024-04-01", updated_at: "2024-04-03" },
  { id: "f2", student_id: "u7", amount_due: 15000, amount_paid: 10000, discount_amount: 0, due_date: "2024-04-05", status: "partial", receipt_number: "REC-002", created_at: "2024-04-01", updated_at: "2024-04-05" },
  { id: "f3", student_id: "u8", amount_due: 15000, amount_paid: 0, discount_amount: 0, due_date: "2024-04-05", status: "overdue", created_at: "2024-04-01", updated_at: "2024-04-10" },
  { id: "f4", student_id: "u9", amount_due: 15000, amount_paid: 15000, discount_amount: 2000, discount_reason: "Scholarship", due_date: "2024-05-05", paid_date: "2024-05-01", payment_method: "bank_transfer", status: "paid", receipt_number: "REC-003", created_at: "2024-05-01", updated_at: "2024-05-01" },
  { id: "f5", student_id: "u10", amount_due: 15000, amount_paid: 0, discount_amount: 0, due_date: "2024-05-05", status: "pending", created_at: "2024-05-01", updated_at: "2024-05-01" },
];

// ─── Announcements ──────────────────────────────────
export const demoAnnouncements: Announcement[] = [
  { id: "a1", title: "Welcome to New Academic Year 2024-25", content: "We are excited to welcome all students and teachers to the new academic year. Classes begin from April 1st.", type: "general", target_role: ["all"], is_pinned: true, published_by: "u2", publish_at: "2024-03-25", created_at: "2024-03-25" },
  { id: "a2", title: "Mid-Term Exams Schedule", content: "Mid-term examinations will be held from August 15-25. Detailed schedule will be shared batch-wise.", type: "exam", target_role: ["student", "teacher"], is_pinned: false, published_by: "u2", publish_at: "2024-08-01", created_at: "2024-08-01" },
  { id: "a3", title: "Independence Day Holiday", content: "Center will remain closed on August 15th for Independence Day. Regular classes resume August 16th.", type: "holiday", target_role: ["all"], is_pinned: false, published_by: "u2", publish_at: "2024-08-10", created_at: "2024-08-10" },
];

// ─── Notifications ──────────────────────────────────
export const demoNotifications: Notification[] = [
  { id: "n1", user_id: "u2", title: "New Admission Inquiry", message: "Riya Kapoor submitted an admission inquiry for JEE Mains batch.", type: "info", is_read: false, action_url: "/admin/admissions", created_at: "2024-09-15T10:30:00" },
  { id: "n2", user_id: "u2", title: "Fee Overdue Alert", message: "3 students have overdue fees for September.", type: "fee", is_read: false, action_url: "/admin/fees", created_at: "2024-09-10T09:00:00" },
  { id: "n3", user_id: "u2", title: "Attendance Alert", message: "Arjun Singh attendance dropped below 75%.", type: "attendance", is_read: true, action_url: "/admin/attendance", created_at: "2024-09-05T14:00:00" },
];

// ─── Audit Logs ─────────────────────────────────────
export const demoAuditLogs: AuditLog[] = [
  { id: "al1", user_id: "u2", action: "created", resource: "student", resource_id: "u15", created_at: "2024-09-15T11:00:00", user: demoProfiles[1] },
  { id: "al2", user_id: "u3", action: "updated", resource: "exam", resource_id: "e1", created_at: "2024-09-14T16:30:00", user: demoProfiles[2] },
  { id: "al3", user_id: "u2", action: "created", resource: "announcement", resource_id: "a3", created_at: "2024-09-13T09:15:00", user: demoProfiles[1] },
  { id: "al4", user_id: "u4", action: "created", resource: "attendance", resource_id: "as1", created_at: "2024-09-12T10:00:00", user: demoProfiles[3] },
  { id: "al5", user_id: "u2", action: "updated", resource: "fee", resource_id: "f2", created_at: "2024-09-11T14:45:00", user: demoProfiles[1] },
];

// ─── Dashboard Stats ────────────────────────────────
export const demoStats = {
  superadmin: {
    totalStudents: { value: 10, change: 12 },
    totalTeachers: { value: 3, change: 0 },
    totalBranches: { value: 1, change: 0 },
    revenueThisMonth: { value: 150000, change: 8 },
  },
  admin: {
    activeStudents: { value: 10, change: 12 },
    totalTeachers: { value: 3, change: 0 },
    attendanceToday: { value: 87, change: 3 },
    feesCollected: { value: 150000, change: 8 },
    pendingAdmissions: { value: 5, change: -2 },
  },
  teacher: {
    myStudents: { value: 8, change: 2 },
    classesToday: { value: 3, change: 0 },
    pendingScores: { value: 2, change: -1 },
    avgPerformance: { value: 72, change: 5 },
  },
  student: {
    attendancePercent: { value: 85, change: 2 },
    averageScore: { value: 78, change: 5 },
    batchRank: { value: 3, change: 1 },
    pendingHomework: { value: 2, change: -1 },
  },
};

// ─── Chart Data ─────────────────────────────────────
export const enrollmentChartData = [
  { month: "Apr", students: 4 },
  { month: "May", students: 6 },
  { month: "Jun", students: 7 },
  { month: "Jul", students: 8 },
  { month: "Aug", students: 8 },
  { month: "Sep", students: 9 },
  { month: "Oct", students: 10 },
  { month: "Nov", students: 10 },
  { month: "Dec", students: 10 },
  { month: "Jan", students: 10 },
  { month: "Feb", students: 10 },
  { month: "Mar", students: 10 },
];

export const batchStudentData = [
  { name: "Foundation Alpha", students: 4 },
  { name: "JEE Mains A", students: 4 },
  { name: "NEET Warriors", students: 2 },
];

export const feeCollectionData = [
  { month: "Apr", collected: 60000, pending: 15000 },
  { month: "May", collected: 55000, pending: 20000 },
  { month: "Jun", collected: 65000, pending: 10000 },
  { month: "Jul", collected: 70000, pending: 5000 },
  { month: "Aug", collected: 60000, pending: 15000 },
  { month: "Sep", collected: 75000, pending: 10000 },
];

export const studentScoreTrend = [
  { exam: "Quiz 1", score: 72 },
  { exam: "Mid-Term", score: 78 },
  { exam: "Mock 1", score: 65 },
  { exam: "Quiz 2", score: 80 },
  { exam: "Mock 2", score: 85 },
  { exam: "Final", score: 82 },
];
