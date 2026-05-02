import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ["/login", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If not authenticated and not on public route, redirect to login
  if (!user && !isPublicRoute && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If authenticated, get role and enforce route access
  if (user && !isPublicRoute && pathname !== "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (profile) {
      // Block inactive users
      if (!profile.is_active) {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }

      const role = profile.role;
      const roleRoutes: Record<string, string> = {
        superadmin: "/superadmin",
        admin: "/admin",
        teacher: "/teacher",
        student: "/student",
      };

      // Prevent role-hopping: check if accessing a different role's routes
      const dashboardRoles = Object.keys(roleRoutes);
      for (const r of dashboardRoles) {
        if (pathname.startsWith(roleRoutes[r]) && r !== role) {
          // Redirect to their correct dashboard
          const url = request.nextUrl.clone();
          url.pathname = roleRoutes[role];
          return NextResponse.redirect(url);
        }
      }
    }
  }

  // If authenticated and on login page, redirect to dashboard
  if (user && isPublicRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      const roleRoutes: Record<string, string> = {
        superadmin: "/superadmin",
        admin: "/admin",
        teacher: "/teacher",
        student: "/student",
      };
      const url = request.nextUrl.clone();
      url.pathname = roleRoutes[profile.role] || "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
