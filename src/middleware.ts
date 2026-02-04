import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes publiques (pas besoin d'être authentifié)
const publicRoutes = [
  '/login',
  '/register',
  '/register/supplier',
  '/register/store',
  '/forgot-password',
  '/reset-password',
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Permettre la page d'accueil
  if (pathname === '/') {
    return supabaseResponse
  }

  // Permettre les routes publiques
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  if (isPublicRoute) {
    // Si déjà connecté et sur une page auth, rediriger vers /offers
    if (user && (pathname === '/login' || pathname.startsWith('/register'))) {
      return NextResponse.redirect(new URL('/offers', request.url))
    }
    return supabaseResponse
  }

  // Vérifier l'authentification pour les routes protégées
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
