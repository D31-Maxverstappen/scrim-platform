'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { Stage, Layer, Line, Arrow, Circle, Rect, Group, Image as KonvaImage } from 'react-konva'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { minimapIcon, mapIcon, mapSlug } from '@/lib/valorantMaps'
import { agentIcon, agentSlug, AGENT_NAMES } from '@/lib/valorantAgents'
import { ABILITIES } from '@/lib/valorantAbilities'
import { SKILL_RANGES, RANGE_COLORS, rangePx, type SkillRange } from '@/lib/valorantSkillRanges'
import { HexColorPicker, HexColorInput } from 'react-colorful'

// hex → rgba(반투명 채움용).
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

// 툴바 SVG 아이콘 — 이모지 대신 currentColor 라인 아이콘.
const svgProps = { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const IconPen = () => <svg {...svgProps}><path d="M2.5 13.5l1-3 7-7 2 2-7 7-3 1z" /><path d="M9.5 4.5l2 2" /></svg>
const IconArrow = () => <svg {...svgProps}><path d="M3 13L13 3" /><path d="M6.5 3H13v6.5" /></svg>
const IconPan = () => <svg {...svgProps}><path d="M8 2.2v11.6M2.2 8h11.6M8 2.2L6 4.4M8 2.2l2 2.2M8 13.8l-2-2.2M8 13.8l2-2.2M2.2 8l2.2-2M2.2 8l2.2 2M13.8 8l-2.2-2M13.8 8l-2.2 2" /></svg>
const IconRotate = () => <svg {...svgProps}><path d="M13.5 8a5.5 5.5 0 1 1-1.7-3.97" /><path d="M13.6 2.2V5h-2.8" /></svg>
const IconFit = () => <svg {...svgProps}><path d="M2.5 6V2.5H6M14 6V2.5h-3.5M2.5 10v3.5H6M14 10v3.5h-3.5" /></svg>

// 전략 노트 작전판 v1 — 맵 미니맵 배경 위에 펜·화살표로 그리고 요원·스킬 토큰을 배치한다.
// 라이브러리: react-konva(Konva). 클라이언트 전용(ssr:false로 로드).

const MAPS = ['어센트', '바인드', '헤이븐', '스플릿', '로터스', '선셋', '어비스', '아이스박스', '브리즈', '프랙처', '펄', '코로드', '서밋']
const FIXED_COLORS = ['#ffffff', '#000000'] // 항상 노출(흑·백 고정)
const PALETTE = ['#00D2BE', '#ff4655', '#ffd700', '#3b82f6', '#a855f7', '#ff6b3d', '#22c55e', '#06b6d4', '#f97316', '#ec4899'] // 색 선택 팔레트
const SIZE = 680

type Tool = 'pen' | 'arrow' | 'pan'
type Stroke = { tool: Tool; points: number[]; color: string; width: number }
const ZOOM = { min: 0.6, max: 6, sensitivity: 0.0005 } // 스크롤 양 비례(작을수록 천천히)
type Token = { id: string; icon: string; x: number; y: number; size: number; range?: SkillRange | null }

// 토큰에 붙는 스킬 범위 도형(원=연막·몰리·정찰·제어 / 벽=수평 선분). 아이콘 아래에 깔린다.
function RangeShape({ range, mapSlug: slug }: { range: SkillRange; mapSlug: string | null }) {
  const px = rangePx(range.meters, slug, SIZE)
  if (!px) return null
  const color = RANGE_COLORS[range.kind]
  if (range.shape === 'circle') {
    return <Circle x={0} y={0} radius={px} fill={rgba(color, 0.16)} stroke={color} strokeWidth={1.5} listening={false} />
  }
  // 벽 — 길이 px의 수평 선분(중앙 정렬). 방향 회전은 추후.
  return <Rect x={-px / 2} y={-3} width={px} height={6} cornerRadius={3} fill={rgba(color, 0.45)} stroke={color} strokeWidth={1.5} listening={false} />
}

// 캔버스 위 이미지 토큰(요원·스킬 공용) — 드래그 이동·클릭 선택. 선택 시 틸 테두리.
// 스킬 범위가 있으면 아이콘 아래에 도형을 함께 그려 한 그룹으로 드래그.
function ImgToken({ obj, mapSlug: slug, rotation, selected, onSelect, onMove }: {
  obj: Token
  mapSlug: string | null
  rotation: number
  selected: boolean
  onSelect: () => void
  onMove: (x: number, y: number) => void
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const i = new window.Image()
    i.src = obj.icon
    i.onload = () => setImg(i)
  }, [obj.icon])
  if (!img) return null
  return (
    <Group
      x={obj.x}
      y={obj.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onSelect}
      onDragEnd={(e) => onMove(e.target.x(), e.target.y())}
    >
      {obj.range && <RangeShape range={obj.range} mapSlug={slug} />}
      <KonvaImage
        image={img}
        x={0}
        y={0}
        offsetX={obj.size / 2}
        offsetY={obj.size / 2}
        rotation={-rotation}
        width={obj.size}
        height={obj.size}
        cornerRadius={6}
        stroke="#00D2BE"
        strokeWidth={selected ? 3 : 0}
        strokeEnabled={selected}
        shadowColor="#000"
        shadowBlur={selected ? 10 : 4}
        shadowOpacity={0.6}
      />
    </Group>
  )
}

export type BoardData = { map: string; strokes: Stroke[]; tokens: Token[] }

export default function StrategyBoard({ teamId, matchId = null, initialData, onSaved, onClose }: {
  teamId?: string
  matchId?: string | null
  initialData?: BoardData
  onSaved?: () => void
  onClose?: () => void
} = {}) {
  const [map, setMap] = useState(initialData?.map ?? '어센트')
  const [saving, setSaving] = useState(false)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#00D2BE')
  const [colorOpen, setColorOpen] = useState(false)
  const [width, setWidth] = useState(3)
  const [rotation, setRotation] = useState(0) // 맵 회전(0/90/180/270)
  const [strokes, setStrokes] = useState<Stroke[]>(initialData?.strokes ?? [])
  const [tokens, setTokens] = useState<Token[]>(initialData?.tokens ?? [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openAgent, setOpenAgent] = useState<string | null>(null) // 하단 바에서 스킬을 펼친 요원
  const [mapImg, setMapImg] = useState<HTMLImageElement | null>(null)
  const drawing = useRef(false)
  const stageRef = useRef<Konva.Stage>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const agentBarRef = useRef<HTMLDivElement>(null)
  const colorPalRef = useRef<HTMLDivElement>(null)

  // 맵 바뀌면 미니맵 배경 로드
  useEffect(() => {
    const src = minimapIcon(map)
    if (!src) { setMapImg(null); return }
    const img = new window.Image()
    img.src = src
    img.onload = () => setMapImg(img)
  }, [map])

  // 요원 바·색 팔레트 밖을 클릭하면 닫기
  useEffect(() => {
    if (!openAgent && !colorOpen) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (openAgent && agentBarRef.current && !agentBarRef.current.contains(t)) setOpenAgent(null)
      if (colorOpen && colorPalRef.current && !colorPalRef.current.contains(t)) setColorOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [openAgent, colorOpen])

  // Delete/Backspace 로 선택 토큰 삭제
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        setTokens((prev) => prev.filter((t) => t.id !== selectedId))
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  const start = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === 'pan') return // 이동 모드: 스테이지가 드래그(팬) 처리
    const stage = e.target.getStage()
    // 토큰 위에서 시작하면 그리기 안 함(토큰이 선택/드래그 처리)
    if (e.target !== stage && e.target.name() !== 'bg') return
    setSelectedId(null) // 빈 곳 클릭 → 선택 해제
    drawing.current = true
    // 줌/팬/회전을 반영한 콘텐츠 좌표(레이어 상대좌표) → 어긋나지 않음
    const pos = layerRef.current?.getRelativePointerPosition()
    if (!pos) return
    setStrokes((prev) => [...prev, { tool, points: [pos.x, pos.y], color, width }])
  }

  const move = () => {
    if (!drawing.current) return
    const pos = layerRef.current?.getRelativePointerPosition()
    if (!pos) return
    setStrokes((prev) => {
      const last = prev[prev.length - 1]
      if (!last) return prev
      const points = last.tool === 'arrow'
        ? [last.points[0], last.points[1], pos.x, pos.y]
        : [...last.points, pos.x, pos.y]
      return [...prev.slice(0, -1), { ...last, points }]
    })
  }

  const end = () => { drawing.current = false }

  // 마우스 휠 확대/축소 — 포인터 위치 기준.
  const onWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    const pointer = stage?.getPointerPosition()
    if (!stage || !pointer) return
    const oldScale = stage.scaleX()
    const to = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale }
    // 스크롤 양(deltaY)에 비례한 부드러운 배율. deltaY>0(아래)=축소, <0(위)=확대.
    const next = oldScale * Math.exp(-e.evt.deltaY * ZOOM.sensitivity)
    const s = Math.max(ZOOM.min, Math.min(ZOOM.max, next))
    stage.scale({ x: s, y: s })
    stage.position({ x: pointer.x - to.x * s, y: pointer.y - to.y * s })
    stage.batchDraw()
  }

  // 원위치(확대·이동 초기화). 더블클릭·버튼 공용.
  const resetView = () => {
    const stage = stageRef.current
    if (!stage) return
    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })
    stage.batchDraw()
  }
  const undo = () => setStrokes((prev) => prev.slice(0, -1))
  const clear = () => { setStrokes([]); setTokens([]); setSelectedId(null) }

  const addToken = (icon: string, size: number, range: SkillRange | null = null) => {
    setTokens((prev) => {
      const n = prev.length
      const ox = (n % 4) * 46 - 69
      const oy = Math.floor(n / 4) * 46 - 46
      return [...prev, { id: crypto.randomUUID(), icon, x: SIZE / 2 + ox, y: SIZE / 2 + oy, size, range }]
    })
  }
  const moveToken = (id: string, x: number, y: number) =>
    setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, x, y } : t)))
  const removeSelected = () => {
    if (!selectedId) return
    setTokens((prev) => prev.filter((t) => t.id !== selectedId))
    setSelectedId(null)
  }

  const exportPNG = () => {
    setSelectedId(null)
    const stage = stageRef.current
    // 줌/팬 상태와 무관하게 항상 전체 보드를 내보내기 위해 잠시 원위치 → 캡처 → 복원.
    const prevScale = stage?.scaleX() ?? 1
    const prevPos = stage?.position() ?? { x: 0, y: 0 }
    if (stage) { stage.scale({ x: 1, y: 1 }); stage.position({ x: 0, y: 0 }); stage.batchDraw() }
    requestAnimationFrame(() => {
      const uri = stageRef.current?.toDataURL({ pixelRatio: 2 })
      if (stage) { stage.scale({ x: prevScale, y: prevScale }); stage.position(prevPos); stage.batchDraw() }
      if (!uri) return
      const a = document.createElement('a')
      a.download = `작전판_${map}.png`
      a.href = uri
      a.click()
    })
  }

  // 팀 전략노트로 저장(작전판 데이터를 board_data JSON으로)
  const saveAsNote = async () => {
    if (!teamId || saving) return
    setSaving(true)
    const boardData: BoardData = { map, strokes, tokens }
    const res = await fetch('/api/team-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, matchId, content: '', boardData }),
    })
    setSaving(false)
    if (res.ok) onSaved?.()
    else alert('저장에 실패했어요. 팀원만 저장할 수 있어요.')
  }

  const toolBtn = (t: Tool, content: ReactNode) => (
    <button
      onClick={() => setTool(t)}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition ${tool === t ? 'bg-[#00D2BE] text-[#04342c]' : 'bg-white/5 text-slate-400 hover:text-white'}`}
    >
      {content}
    </button>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* 툴바 — 그리기 도구만(맵·요원·스킬은 하단/우측으로 분리) */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded bg-[#13131f] border border-white/5">
        <div className="flex gap-1.5">
          {toolBtn('pen', <><IconPen /> 펜</>)}
          {toolBtn('arrow', <><IconArrow /> 화살표</>)}
          {toolBtn('pan', <><IconPan /> 이동</>)}
          <button onClick={() => setRotation((r) => (r + 90) % 360)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-white/5 text-slate-400 hover:text-white transition" title="맵 90° 회전"><IconRotate /> 회전</button>
          <button onClick={resetView} className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-white/5 text-slate-400 hover:text-white transition" title="확대·이동 초기화(더블클릭)"><IconFit /> 원위치</button>
        </div>

        {/* 색 — 흑·백 고정 + 색 선택 팔레트 */}
        <div className="flex items-center gap-1.5">
          {FIXED_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border-2 transition ${color === c ? 'border-[#00D2BE] scale-110' : 'border-white/30'}`}
              style={{ background: c }}
              aria-label={c}
            />
          ))}
          <div className="relative" ref={colorPalRef}>
            <button
              onClick={() => setColorOpen((o) => !o)}
              title="색 선택 (그라데이션)"
              className={`relative grid place-items-center w-6 h-6 rounded-full border-2 transition hover:scale-110 ${colorOpen || !FIXED_COLORS.includes(color) ? 'border-[#00D2BE] scale-110' : 'border-white/50'}`}
              style={{ background: 'conic-gradient(from 0deg, #ff4655, #ff8a00, #ffd700, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ff4655)' }}
            >
              <span className="w-2.5 h-2.5 rounded-full border border-black/40 shadow" style={{ background: color }} />
            </button>
            {colorOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 p-3 rounded-lg border border-white/10 bg-[#1e1e2e] shadow-2xl board-colorpicker">
                {/* 포토샵식 그라데이션 피커(채도·명도 + 색조 슬라이더) */}
                <HexColorPicker color={color} onChange={setColor} />
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-xs text-slate-500">#</span>
                  <HexColorInput color={color} onChange={setColor} className="w-20 bg-[#0a0a0e] border border-white/10 rounded px-2 py-1 text-xs text-white uppercase tracking-wide" />
                  <div className="flex gap-1 ml-auto">
                    {PALETTE.slice(0, 5).map((c) => (
                      <button key={c} onClick={() => setColor(c)} title={c} className="w-4 h-4 rounded-full border border-white/20" style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
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
          {selectedId && (
            <button onClick={removeSelected} className="px-3 py-1.5 rounded text-xs font-bold bg-[#ff4655]/15 text-[#ff4655] hover:bg-[#ff4655]/25 transition">토큰 삭제</button>
          )}
          <button onClick={undo} className="px-3 py-1.5 rounded text-xs font-bold bg-white/5 text-slate-400 hover:text-white transition">되돌리기</button>
          <button onClick={clear} className="px-3 py-1.5 rounded text-xs font-bold bg-white/5 text-slate-400 hover:text-white transition">전체 지우기</button>
          <button onClick={exportPNG} className="px-3 py-1.5 rounded text-xs font-bold bg-white/5 text-slate-300 hover:text-white transition">저장하기</button>
          {teamId && (
            <button onClick={saveAsNote} disabled={saving} className="px-3 py-1.5 rounded text-xs font-black bg-[#00D2BE] text-[#04342c] hover:opacity-90 transition disabled:opacity-50">
              {saving ? '저장 중…' : '노트 저장'}
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="px-2 py-1.5 rounded text-xs font-bold bg-white/5 text-slate-400 hover:text-white transition">닫기</button>
          )}
        </div>
      </div>

      {/* 작전판: 좌(캔버스 + 하단 요원 바) / 우(맵 패널) */}
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-3">
          {/* 캔버스 */}
          <div className={`rounded overflow-hidden border border-white/10 bg-[#0a0a0e] ${tool === 'pan' ? 'cursor-grab active:cursor-grabbing' : ''}`} style={{ width: SIZE, height: SIZE }}>
            <Stage
              ref={stageRef}
              width={SIZE}
              height={SIZE}
              draggable={tool === 'pan'}
              onWheel={onWheel}
              onDblClick={resetView}
              onDblTap={resetView}
              onMouseDown={start}
              onMouseMove={move}
              onMouseUp={end}
              onTouchStart={start}
              onTouchMove={move}
              onTouchEnd={end}
            >
              <Layer ref={layerRef} x={SIZE / 2} y={SIZE / 2} offsetX={SIZE / 2} offsetY={SIZE / 2} rotation={rotation}>
                {mapImg && <KonvaImage image={mapImg} width={SIZE} height={SIZE} name="bg" />}
                {strokes.map((s, i) =>
                  s.tool === 'arrow'
                    ? <Arrow key={i} points={s.points} stroke={s.color} fill={s.color} strokeWidth={s.width} pointerLength={10} pointerWidth={10} />
                    : <Line key={i} points={s.points} stroke={s.color} strokeWidth={s.width} lineCap="round" lineJoin="round" tension={0.3} />
                )}
                {tokens.map((o) => (
                  <ImgToken
                    key={o.id}
                    obj={o}
                    mapSlug={mapSlug(map)}
                    rotation={rotation}
                    selected={selectedId === o.id}
                    onSelect={() => setSelectedId(o.id)}
                    onMove={(x, y) => moveToken(o.id, x, y)}
                  />
                ))}
              </Layer>
            </Stage>
          </div>

          {/* 하단 요원 바 — 이미지로 선택. 클릭하면 위에 요원·스킬 이미지가 펼쳐짐 */}
          <div ref={agentBarRef} className="flex flex-wrap gap-1.5 p-2 rounded bg-[#13131f] border border-white/5" style={{ width: SIZE }}>
            {AGENT_NAMES.map((a) => {
              const isOpen = openAgent === a
              const skills = ABILITIES[agentSlug(a) ?? ''] ?? []
              const slug = agentSlug(a) ?? ''
              return (
                <div key={a} className="relative">
                  <button
                    onClick={() => setOpenAgent(isOpen ? null : a)}
                    title={a}
                    className={`w-10 h-10 rounded overflow-hidden bg-[#0a0a0e] transition ${isOpen ? 'ring-2 ring-[#00D2BE]' : 'hover:ring-2 hover:ring-white/30'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={agentIcon(a) ?? ''} alt={a} className="w-full h-full object-cover" />
                  </button>
                  {isOpen && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 flex items-end gap-1.5 p-3 rounded-lg border border-white/10 bg-[#1e1e2e] shadow-2xl">
                      {/* 요원 토큰 */}
                      <button onClick={() => addToken(agentIcon(a) ?? '', 40)} title={`${a} 배치`} className="flex flex-col items-center gap-1.5 p-1.5 rounded hover:bg-white/5 transition shrink-0 w-14">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={agentIcon(a) ?? ''} alt={a} className="w-12 h-12 object-cover rounded" />
                        <span className="text-[10px] text-slate-300 font-bold">요원</span>
                      </button>
                      <div className="self-stretch w-px bg-white/10 mx-0.5" />
                      {/* 스킬 토큰 */}
                      {skills.map((ab) => (
                        <button
                          key={ab.icon}
                          onClick={() => addToken(ab.icon, 34, SKILL_RANGES[`${slug}:${ab.name}`] ?? null)}
                          title={ab.name}
                          className="flex flex-col items-center gap-1.5 p-1.5 rounded hover:bg-white/5 transition w-16 shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ab.icon} alt={ab.name} className="w-11 h-11 object-contain" />
                          <span className="text-[10px] text-slate-400 truncate w-full text-center">{ab.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 우측 맵 패널 — 실제 맵 이미지로 선택 */}
        <div className="flex flex-col gap-1 p-2 rounded bg-[#13131f] border border-white/5 overflow-auto" style={{ maxHeight: SIZE, width: 172 }}>
          <div className="text-[10px] font-bold text-slate-500 px-1 pb-1">맵</div>
          {MAPS.map((m) => (
            <button
              key={m}
              onClick={() => setMap(m)}
              className={`flex items-center gap-2 p-1 rounded transition ${m === map ? 'bg-[#00D2BE]/15 ring-1 ring-[#00D2BE]' : 'hover:bg-white/5'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mapIcon(m) ?? ''} alt={m} className="w-16 h-9 object-cover rounded bg-[#0a0a0e] shrink-0" />
              <span className={`text-xs ${m === map ? 'text-[#00D2BE] font-bold' : 'text-slate-300'}`}>{m}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-slate-600">아래 요원 클릭 → 위에 뜬 요원·스킬 이미지로 배치 · 오른쪽에서 맵 선택. 토큰 드래그 이동·클릭 후 삭제, 펜·화살표로 작전. 휠 확대·✋이동 팬·더블클릭 원위치 → PNG 저장.</p>
    </div>
  )
}
