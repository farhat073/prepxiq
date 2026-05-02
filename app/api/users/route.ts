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

// POST /api/users — Create a new user (auth + profile)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, role, phone, branch_id } = body;

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: "email, password, full_name, and role are required" }, { status: 400 });
    }

    const admin = getAdminClient();

    // Create auth user (this also triggers the handle_new_user function which creates the profile)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email so they can log in immediately
      user_metadata: { full_name, role },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Update the auto-created profile with additional fields
    if (authData.user && (phone || branch_id)) {
      await admin.from("profiles").update({
        phone: phone || null,
        branch_id: branch_id || null,
      }).eq("id", authData.user.id);
    }

    return NextResponse.json({ user: authData.user }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating user:", err);
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
