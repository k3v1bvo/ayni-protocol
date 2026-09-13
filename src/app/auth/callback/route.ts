import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /auth/callback
 *
 * Paso obligatorio del flujo OAuth (PKCE) de Supabase: Google redirige aqui
 * con un `code` en la query string, y este endpoint lo intercambia por una
 * sesion real (cookies httpOnly) antes de mandar al usuario al dashboard.
 * Sin este paso, `signInWithOAuth` nunca completaba una sesion real —
 * getSession() siempre devolvia null en el cliente.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('[OAuth Callback] Error intercambiando codigo por sesion:', error.message);
  }

  return NextResponse.redirect(`${origin}/auth?error=oauth_failed`);
}
