'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  content: string
  created_at: string
  user_id: string
  users: { riot_gamename: string | null; avatar_url: string | null } | { riot_gamename: string | null; avatar_url: string | null }[] | null
}

export default function TeamChat({
  teamId,
  currentUserId,
  isMember,
}: {
  teamId: string
  currentUserId: string
  isMember: boolean
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = useRef(createClient()).current
  const seenIds = useRef(new Set<string>())

  const addMessage = (msg: Message) => {
    if (seenIds.current.has(msg.id)) return
    seenIds.current.add(msg.id)
    setMessages((prev) => [...prev, msg])
  }

  useEffect(() => {
    supabase
      .from('team_messages')
      .select('id, content, created_at, user_id, users(riot_gamename, avatar_url)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) {
          data.forEach((m: { id: string }) => seenIds.current.add(m.id))
          setMessages(data as Message[])
        }
      })

    // 필터 없이 전체 구독 후 클라이언트에서 team_id 필터링
    const channel = supabase
      .channel(`team_chat_${teamId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_messages' },
        async (payload) => {
          if (payload.new.team_id !== teamId) return
          const { data } = await supabase
            .from('team_messages')
            .select('id, content, created_at, user_id, users(riot_gamename, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (data) addMessage(data as Message)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [teamId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    setError(null)
    setInput('')

    const { data: inserted, error: insertError } = await supabase
      .from('team_messages')
      .insert({ team_id: teamId, user_id: currentUserId, content })
      .select('id, content, created_at, user_id, users(riot_gamename, avatar_url)')
      .single()

    if (insertError) {
      setError(insertError.message)
      setInput(content)
    } else if (inserted) {
      // Realtime을 기다리지 않고 즉시 표시
      addMessage(inserted as Message)
    }
    setSending(false)
  }

  if (!isMember) {
    return (
      <div className="bg-[#13131f] border border-white/5 rounded p-16 text-center">
        <p className="text-slate-500 text-sm">팀원만 채팅을 이용할 수 있어요</p>
      </div>
    )
  }

  return (
    <div className="bg-[#13131f] border border-white/5 rounded flex flex-col h-[520px]">
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-slate-600 text-sm text-center mt-8">아직 메시지가 없어요. 먼저 인사해보세요!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === currentUserId
          const u = Array.isArray(msg.users) ? msg.users[0] : msg.users
          const name = isMe ? '나' : (u?.riot_gamename ?? '알 수 없음')
          const time = new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              {/* 아바타 */}
              <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-sm font-black"
                style={{ background: isMe ? '#00D2BE33' : '#ffffff11', color: isMe ? '#00D2BE' : '#94a3b8' }}>
                {u?.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (u?.riot_gamename ?? '?')[0]?.toUpperCase()
                )}
              </div>
              {/* 말풍선 */}
              <div className={`flex flex-col gap-1 max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-baseline gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-xs font-bold ${isMe ? 'text-[#00D2BE]' : 'text-white'}`}>{name}</span>
                  <span className="text-slate-600 text-[10px]">{time}</span>
                </div>
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-[#00D2BE]/20 text-[#00D2BE] rounded-tr-sm'
                    : 'bg-white/8 text-white rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-red-400 text-xs">전송 실패: {error}</p>
        </div>
      )}
      <div className="border-t border-white/5 px-4 py-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="메시지 입력... (Enter로 전송)"
          className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition"
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-30 text-white text-sm font-semibold px-4 py-2 rounded transition"
        >
          전송
        </button>
      </div>
    </div>
  )
}
