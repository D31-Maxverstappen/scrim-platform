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

  useEffect(() => {
    supabase
      .from('team_messages')
      .select('id, content, created_at, user_id, users(riot_gamename, avatar_url)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages(data as Message[])
      })

    const channel = supabase
      .channel(`team_chat_${teamId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_messages', filter: `team_id=eq.${teamId}` },
        async (payload) => {
          const { data } = await supabase
            .from('team_messages')
            .select('id, content, created_at, user_id, users(riot_gamename, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (data) setMessages((prev) => [...prev, data as Message])
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
    const { error: insertError } = await supabase.from('team_messages').insert({ team_id: teamId, user_id: currentUserId, content })
    if (insertError) {
      setError(insertError.message)
      setInput(content)
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
          const name = u?.riot_gamename ?? '알 수 없음'
          const time = new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 shrink-0 rounded bg-[#00D2BE]/20 flex items-center justify-center text-[#00D2BE] text-xs font-black overflow-hidden">
                {u?.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  name[0]?.toUpperCase() ?? '?'
                )}
              </div>
              <div className={`max-w-[65%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <p className="text-slate-500 text-[10px] px-1">{name}</p>}
                <div className={`px-3 py-2 rounded text-sm leading-relaxed ${isMe ? 'bg-[#00D2BE]/20 text-[#00D2BE]' : 'bg-white/5 text-white'}`}>
                  {msg.content}
                </div>
                <p className="text-slate-700 text-[10px] px-1">{time}</p>
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
