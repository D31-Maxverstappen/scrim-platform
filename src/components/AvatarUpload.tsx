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
        <img src={url} alt="avatar" className="w-20 h-20 rounded-2xl object-cover" />
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00D2BE] to-purple-600 flex items-center justify-center text-white text-3xl font-black">
          {initials}
        </div>
      )}

      {/* 호버 오버레이 */}
      <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        {uploading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A4 4 0 019 17H7v-2a4 4 0 012.172-2.828z" />
          </svg>
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
