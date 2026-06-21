import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 정지 페이지, 로그인 페이지는 체크 제외 (리다이렉트 루프 방지)
  if (pathname.startsWith('/suspended') || pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cs) {
          cs.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cs.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 로그인 안 된 유저는 페이지 자체에서 처리
  if (!user) return response

  // 정지 여부 확인
  const { data: profile } = await supabase
    .from('users')
    .select('suspended')
    .eq('id', user.id)
    .single()

  if (profile?.suspended) {
    await supabase.auth.signOut()
    const url = new URL('/suspended', request.url)
    url.searchParams.set('uid', user.id)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|api/).*)',
  ],
}
