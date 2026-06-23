'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  userId: string
  initialUrl: string | null
  initials: string
}

export default function AvatarUpload({ userId, initialUrl, initials }: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('파일 크기는 2MB 이하여야 해요.')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      alert('업로드 실패: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = data.publicUrl + '?t=' + Date.now()

    await supabase.from('users').update({ avatar_url: data.publicUrl }).eq('id', userId)

    setUrl(publicUrl)
    setUploading(false)
  }

  return (
    <div className="relative w-20 h-20 shrink-0 group cursor-pointer" onClick={() => inputRef.current?.click()}>
      {url ? (
        <img src={url} alt="avatar" className="w-20 h-20 rounded object-cover" onError={() => setUrl(null)} />
      ) : (
        <div className="avatar-upload-ph w-20 h-20 rounded border border-dashed flex items-center justify-center">
          <span className="avatar-upload-icon text-3xl font-black leading-none select-none">?</span>
        </div>
      )}

      {/* 호버 오버레이 */}
      <div className="absolute inset-0 rounded bg-black/60 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
        {uploading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white text-[10px] font-bold leading-none">
              {url ? '변경하기' : '사진 추가하기'}
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  )
}
