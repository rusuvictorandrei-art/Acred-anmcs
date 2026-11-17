import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_CONFIG_OK, SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

const PUBLIC_PATHS = ["/login", "/auth", "/legal"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  // Fără configurare: lăsăm pagina să afișeze mesajul explicativ în loc să cadă tot site-ul.
  if (!SUPABASE_CONFIG_OK) return response;
  try {
    return await refreshSession(request, response, SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.error("Eroare middleware:", e);
    return response;
  }
}

async function refreshSession(request: NextRequest, initial: NextResponse, url: string, key: string) {
  let response = initial;

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
