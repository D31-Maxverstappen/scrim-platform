'use client'

import { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Line, Arrow, Image as KonvaImage } from 'react-konva'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { minimapIcon } from '@/lib/valorantMaps'

// 전략 노트 작전판 MVP — 맵 미니맵 배경 위에 펜·화살표로 작전을 그리고 PNG로 내보낸다.
// 라이브러리: react-konva(Konva). 클라이언트 전용(ssr:false로 로드).

const MAPS = ['어센트', '바인드', '헤이븐', '스플릿', '로터스', '선셋', '어비스', '아이스박스', '브리즈', '프랙처', '펄', '코로드']
const COLORS = ['#00D2BE', '#ff4655', '#ffd700', '#ffffff', '#3b82f6', '#a855f7']
const SIZE = 680

type Tool = 'pen' | 'arrow'
type Stroke = { tool: Tool; points: number[]; color: string; width: number }

export default function StrategyBoard() {
  const [map, setMap] = useState('어센트')
  const [mapOpen, setMapOpen] = useState(false)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState(COLORS[0])
  const [width, setWidth] = useState(3)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [mapImg, setMapImg] = useState<HTMLImageElement | null>(null)
  const drawing = useRef(false)
  const stageRef = useRef<Konva.Stage>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // 맵 바뀌면 미니맵 배경 로드
  useEffect(() => {
    const src = minimapIcon(map)
    if (!src) { setMapImg(null); return }
    const img = new window.Image()
    img.src = src
    img.onload = () => setMapImg(img)
  }, [map])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!mapOpen) return
    const onDoc = (e: MouseEvent) => {
      if (mapRef.current && !mapRef.current.contains(e.target as Node)) setMapOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [mapOpen])

  const start = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    drawing.current = true
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return
    setStrokes((prev) => [...prev, { tool, points: [pos.x, pos.y], color, width }])
  }

  const move = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!drawing.current) return
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return
    setStrokes((prev) => {
      const last = prev[prev.length - 1]
      if (!last) return prev
      // 화살표는 시작점→현재점 두 점만, 펜은 경로 누적
      const points = last.tool === 'arrow'
        ? [last.points[0], last.points[1], pos.x, pos.y]
        : [...last.points, pos.x, pos.y]
      return [...prev.slice(0, -1), { ...last, points }]
    })
  }

  const end = () => { drawing.current = false }
  const undo = () => setStrokes((prev) => prev.slice(0, -1))
  const clear = () => setStrokes([])

  const exportPNG = () => {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 2 })
    if (!uri) return
    const a = document.createElement('a')
    a.download = `작전판_${map}.png`
    a.href = uri
    a.click()
  }

  const toolBtn = (t: Tool, label: string) => (
    <button
      onClick={() => setTool(t)}
      className={`px-3 py-1.5 rounded text-xs font-bold transition ${tool === t ? 'bg-[#00D2BE] text-[#04342c]' : 'bg-white/5 text-slate-400 hover:text-white'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded bg-[#13131f] border border-white/5">
        <div className="relative" ref={mapRef}>
          <button
            onClick={() => setMapOpen((o) => !o)}
            className="flex items-center justify-between gap-2 min-w-[92px] bg-[#1e1e2e] border border-white/10 text-white text-xs px-3 py-1.5 rounded hover:border-[#00D2BE] transition"
          >
            {map}<span className="text-[8px] text-slate-500">▼</span>
          </button>
          {mapOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 w-32 max-h-64 overflow-auto rounded border border-white/10 bg-[#1e1e2e] shadow-xl py-1">
              {MAPS.map((m) => (
                <button
                  key={m}
                  onClick={() => { setMap(m); setMapOpen(false) }}
                  className={`block w-full text-left px-3 py-1.5 text-xs transition ${m === map ? 'text-[#00D2BE] bg-white/5' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1.5">
          {toolBtn('pen', '✏️ 펜')}
          {toolBtn('arrow', '↗ 화살표')}
        </div>

        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border-2 transition ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ background: c }}
              aria-label={c}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {[2, 4, 7].map((w) => (
            <button
              key={w}
              onClick={() => setWidth(w)}
              className={`w-7 h-7 rounded flex items-center justify-center transition ${width === w ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <span className="rounded-full bg-white" style={{ width: w + 2, height: w + 2 }} />
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 ml-auto">
          <button onClick={undo} className="px-3 py-1.5 rounded text-xs font-bold bg-white/5 text-slate-400 hover:text-white transition">되돌리기</button>
          <button onClick={clear} className="px-3 py-1.5 rounded text-xs font-bold bg-white/5 text-slate-400 hover:text-white transition">전체 지우기</button>
          <button onClick={exportPNG} className="px-3 py-1.5 rounded text-xs font-black bg-[#00D2BE] text-[#04342c] hover:opacity-90 transition">PNG 저장</button>
        </div>
      </div>

      {/* 캔버스 */}
      <div className="inline-block rounded overflow-hidden border border-white/10 bg-[#0a0a0e]" style={{ width: SIZE, height: SIZE }}>
        <Stage
          ref={stageRef}
          width={SIZE}
          height={SIZE}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        >
          <Layer>
            {mapImg && <KonvaImage image={mapImg} width={SIZE} height={SIZE} />}
            {strokes.map((s, i) =>
              s.tool === 'arrow'
                ? <Arrow key={i} points={s.points} stroke={s.color} fill={s.color} strokeWidth={s.width} pointerLength={10} pointerWidth={10} />
                : <Line key={i} points={s.points} stroke={s.color} strokeWidth={s.width} lineCap="round" lineJoin="round" tension={0.3} />
            )}
          </Layer>
        </Stage>
      </div>
      <p className="text-[11px] text-slate-600">맵을 고르고 펜·화살표로 작전을 그린 뒤 PNG로 저장하세요. (MVP — 요원·스킬 아이콘 배치는 v1)</p>
    </div>
  )
}
