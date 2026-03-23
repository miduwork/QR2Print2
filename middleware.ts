import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { userIsAdmin } from "@/lib/auth/adminSession";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session (validate JWT)
  await supabase.auth.getClaims();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");

  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!userIsAdmin(user)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isLoginRoute && user) {
    if (userIsAdmin(user)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
  ],
};
