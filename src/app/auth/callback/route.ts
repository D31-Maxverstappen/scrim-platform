import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// /auth/confirm 으로 그대로 넘김 (쿼리 파라미터 유지)
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const confirmUrl = new URL('/auth/confirm', url.origin)
  // code, error 등 모든 파라미터 그대로 전달
  url.searchParams.forEach((value, key) => {
    confirmUrl.searchParams.set(key, value)
  })
  return NextResponse.redirect(confirmUrl)
}
