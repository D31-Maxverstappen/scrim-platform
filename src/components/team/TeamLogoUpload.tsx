'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  teamId: string
  initialUrl: string | null
  fallbackLetter: string
  color: string
}

export default function TeamLogoUpload({ teamId, initialUrl, fallbackLetter, color }: Props) {
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
    const path = `teams/${teamId}/logo.${ext}`

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

    await supabase.from('teams').update({ logo_url: data.publicUrl }).eq('id', teamId)

    setUrl(publicUrl)
    setUploading(false)
  }

  return (
    <div
      className="relative w-24 h-24 shrink-0 group cursor-pointer border border-white/10 bg-[#13131f] rounded-xl overflow-hidden flex items-center justify-center"
      onClick={() => inputRef.current?.click()}
    >
      {url ? (
        <img src={url} alt="팀 로고" className="w-full h-full object-cover" />
      ) : (
        <div className="avatar-upload-ph w-full h-full flex items-center justify-center border border-dashed">
          {uploading ? (
            <div className="avatar-upload-icon w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="avatar-upload-icon text-3xl font-light leading-none select-none">+</span>
          )}
        </div>
      )}

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
