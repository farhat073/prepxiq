import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Server-side only: uses service_role key to create auth users
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// POST /api/users — Create a new user (auth + profile + role-specific profile)
// Transaction-safe: rolls back auth user if any step fails
export async function POST(request: NextRequest) {
  const admin = getAdminClient();
  let createdUserId: string | null = null;

  try {
    const body = await request.json();
    const {
      email, password, full_name, role, phone, branch_id,
      // Profile fields
      date_of_birth, gender, address,
      // Student-specific fields
      school_name, class_in_school, level_id, batch_id,
      father_name, mother_name, guardian_phone, guardian_email,
      emergency_contact, medical_notes, referral_source, admission_number,
      // Teacher-specific fields
      employee_id, qualification, specialization, experience_years,
      joining_date, salary,
    } = body;

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: "email, password, full_name, and role are required" }, { status: 400 });
    }

    // Step 1: Create auth user (triggers handle_new_user → creates profile row)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    createdUserId = authData.user!.id;

    // Step 2: Update the auto-created profile with additional fields
    const profileUpdates: Record<string, any> = {};
    if (phone) profileUpdates.phone = phone;
    if (branch_id) profileUpdates.branch_id = branch_id;
    if (date_of_birth) profileUpdates.date_of_birth = date_of_birth;
    if (gender) profileUpdates.gender = gender;
    if (address) profileUpdates.address = address;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await admin.from("profiles").update(profileUpdates).eq("id", createdUserId);
      if (profileError) {
        throw new Error(`Failed to update profile: ${profileError.message}`);
      }
    }

    // Step 3: Create role-specific profile (MUST succeed or rollback)
    if (role === "student") {
      const studentData: Record<string, any> = {
        profile_id: createdUserId,
        status: "active",
        scholarship_percent: 0,
        enrollment_date: new Date().toISOString().split("T")[0],
      };
      if (admission_number) studentData.admission_number = admission_number;
      if (school_name) studentData.school_name = school_name;
      if (class_in_school) studentData.class_in_school = class_in_school;
      if (level_id) studentData.current_level_id = level_id;
      if (batch_id) studentData.current_batch_id = batch_id;
      if (father_name) studentData.father_name = father_name;
      if (mother_name) studentData.mother_name = mother_name;
      if (guardian_phone) studentData.guardian_phone = guardian_phone;
      if (guardian_email) studentData.guardian_email = guardian_email;
      if (emergency_contact) studentData.emergency_contact = emergency_contact;
      if (medical_notes) studentData.medical_notes = medical_notes;
      if (referral_source) studentData.referral_source = referral_source;

      const { error: studentError } = await admin.from("student_profiles").insert(studentData);
      if (studentError) {
        throw new Error(`Failed to create student profile: ${studentError.message}`);
      }
      // NOTE: enrolled_count is auto-updated by DB trigger on student_profiles
    }

    if (role === "teacher") {
      const teacherData: Record<string, any> = {
        profile_id: createdUserId,
        status: "active",
      };
      if (employee_id) teacherData.employee_id = employee_id;
      if (qualification) teacherData.qualification = qualification;
      if (specialization) teacherData.specialization = specialization;
      if (experience_years) teacherData.experience_years = experience_years;
      if (joining_date) teacherData.joining_date = joining_date;
      if (salary) teacherData.salary = salary;

      const { error: teacherError } = await admin.from("teacher_profiles").insert(teacherData);
      if (teacherError) {
        throw new Error(`Failed to create teacher profile: ${teacherError.message}`);
      }
    }

    return NextResponse.json({ user: authData.user }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating user:", err);

    // Rollback: delete the auth user if it was created but a later step failed
    if (createdUserId) {
      console.warn(`Rolling back: deleting auth user ${createdUserId} due to error: ${err.message}`);
      await admin.auth.admin.deleteUser(createdUserId).catch(rollbackErr => {
        console.error("Rollback failed:", rollbackErr);
      });
    }

    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/users?id=xxx — Delete a user (auth + profile cascade)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const admin = getAdminClient();

    // Delete from auth
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Also delete profile row
    await admin.from("profiles").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/users — Update an existing user's profile + auth
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, full_name, email, role, phone, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const admin = getAdminClient();

    // Update auth user metadata + email
    const authUpdates: any = { user_metadata: { full_name, role } };
    if (email) authUpdates.email = email;

    const { error: authError } = await admin.auth.admin.updateUserById(id, authUpdates);
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Update profile row
    const { data, error: profileError } = await admin
      .from("profiles")
      .update({
        full_name,
        email,
        role,
        phone: phone || null,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ user: data });
  } catch (err: any) {
    console.error("Error updating user:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
