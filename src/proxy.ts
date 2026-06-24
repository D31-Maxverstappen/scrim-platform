import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 정지 페이지·로그인 페이지는 인증 체크 제외 (리다이렉트 루프 방지)
  if (pathname.startsWith('/suspended') || pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 세션 토큰 자동 갱신 (호출만으로 만료 토큰 리프레시 + 쿠키 재설정)
  // 정지(suspended) 여부는 클라이언트 SuspendedWatcher가 처리 —
  // 매 페이지 이동마다 발생하던 DB 조회 1회를 제거해 전환 속도를 높임
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/confirm|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
