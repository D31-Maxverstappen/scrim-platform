import { createClient as createAdmin } from '@supabase/supabase-js'
import AppealForm from './AppealForm'

export default async function SuspendedPage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string }>
}) {
  const { uid } = await searchParams

  let userName: string | null = null
  if (uid) {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data } = await admin
      .from('users')
      .select('val_gamename, riot_gamename')
      .eq('id', uid)
      .single()
    userName = data?.val_gamename ?? data?.riot_gamename ?? null
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">🚫</span>
        </div>
        <h1 className="text-white font-black text-2xl mb-2">계정 이용 제한</h1>
        {userName && (
          <p className="text-slate-500 text-xs mb-1">{userName}</p>
        )}
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          운영 정책 위반으로 계정이 정지되었습니다.<br />
          정지 해제를 원하시면 이의 신청을 해주세요.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="https://discord.gg/d31"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition"
            style={{ backgroundColor: '#5865F2' }}>
            디스코드 문의하기
          </a>
          {uid ? (
            <AppealForm />
          ) : (
            <p className="text-slate-600 text-xs py-3">이의 신청은 정상적인 로그인 후 정지 감지 시에만 가능합니다.</p>
          )}
          <a
            href="/login"
            className="w-full py-3 rounded-xl text-sm font-bold text-slate-400 transition"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            로그인 페이지로
          </a>
        </div>
      </div>
    </div>
  )
}
