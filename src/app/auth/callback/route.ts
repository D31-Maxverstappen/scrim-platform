import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 브라우저가 직접 세션 교환 처리하도록 클라이언트 페이지로 넘김
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`)
  }

  if (code) {
    return NextResponse.redirect(`${origin}/auth/confirm?code=${code}`)
  }

  return NextResponse.redirect(`${origin}/login`)
}
