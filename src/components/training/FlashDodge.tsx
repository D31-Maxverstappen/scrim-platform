'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { agentIcon } from '@/lib/valorantAgents'

// 모드 2: 3D 시가전 미션 — 좁고 긴 시가지 통로를 전진하며, 구석에 숨은 적이 나를 보면
// 제한시간 내 제압해야 한다(못하면 실패). 동시에 플래시(피닉스·바이스·브리치)를 등 돌려 피하며
// 끝(사이트)까지 안 죽고 도달하면 성공. 마우스 시점=포인터락. ※ 지형·총·플래시 전부 자체 그래픽(IP 회피).

const SPEED = 7
const WALK_MULT = 0.42       // 걷기(Shift) 속도 배수
const CROUCH_MULT = 0.5      // 앉기(Ctrl) 속도 배수
const STAND_EYE = 1.6, CROUCH_EYE = 1.05   // 눈높이(서기/앉기)
const GRAVITY = -22, JUMP_V = 6.2          // 점프 물리
const BOUND_X = 6, BOUND_Z = 46
const REACT_MS = 850       // 적에게 발각된 뒤 제압 제한시간
const SIGHT_RANGE = 18     // 적 시야 거리
const SIGHT_DOT = 0.34     // 적 시야각(~140°)
const WIN_Z = -44          // 이보다 앞 = 사이트 도달(성공)
const ARM_MIN = 1300, ARM_RAND = 2400  // 플래시 간격

// 플래시 — 피닉스·바이스·브리치만. ms=던지고 터질 때까지, motion=작동방식, color=자체색.
const FLASHES = [
  { agent: '피닉스', flash: '커브볼', ms: 600, motion: 'curve', color: '#ff6b3d' },
  { agent: '브리치', flash: '섬광 폭발', ms: 500, motion: 'wall', color: '#ffb03d' },
  { agent: '바이스', flash: '아크 장미', ms: 500, motion: 'placed', color: '#ff5ce0' },
] as const
type Flash = (typeof FLASHES)[number]
type Motion = Flash['motion']

// 난이도(현재는 명목상 선택 UI — 실제 게임 로직 반영은 추후)
const DIFFICULTIES = [
  { id: 'easy', label: '쉬움', desc: '느긋하게 감각 익히기', active: 'bg-emerald-500' },
  { id: 'normal', label: '보통', desc: '기본 밸런스', active: 'bg-sky-500' },
  { id: 'hard', label: '어려움', desc: '적 시야·플래시 강화', active: 'bg-orange-500' },
  { id: 'hell', label: '지옥', desc: '한 번의 실수도 용납되지 않음', active: 'bg-[#ff4655]' },
] as const
type DiffId = (typeof DIFFICULTIES)[number]['id']

// 적 배치(구석·엄폐 뒤) [x,z] — 전부 +z(접근로) 감시
const ENEMY_SPOTS: Array<[number, number]> = [[-4, 21], [4, 5], [-4, -11], [4, -27], [-4, -41], [3, -45]]

type Mission = 'idle' | 'playing' | 'win' | 'lose'

export default function FlashDodge() {
  const mountRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const sensRef = useRef(0.4)
  const [locked, setLocked] = useState(false)
  const [lockError, setLockError] = useState(false)
  const [mission, setMission] = useState<Mission>('idle')
  const [missionMsg, setMissionMsg] = useState('')
  const [kills, setKills] = useState(0)
  const [alerted, setAlerted] = useState(false)
  const [activeFlash, setActiveFlash] = useState<Flash | null>(null)
  const [whiteout, setWhiteout] = useState(0)
  const [headshots, setHeadshots] = useState(0)
  const [hitKind, setHitKind] = useState<'head' | 'body' | null>(null)
  const [sensitivity, setSensitivity] = useState(0.4)   // 발로란트 게임 내 감도값과 동일 스케일
  const [difficulty, setDifficulty] = useState<DiffId>('normal')
  const [showSettings, setShowSettings] = useState(false)

  // 감도 로드/저장 + ref 동기화(포인터락 콜백에서 최신값 참조)
  useEffect(() => {
    const saved = Number(localStorage.getItem('d31_train_valsens'))
    if (saved >= 0.05 && saved <= 2) { setSensitivity(saved); sensRef.current = saved }
    const d = localStorage.getItem('d31_train_diff')
    if (d && DIFFICULTIES.some((x) => x.id === d)) setDifficulty(d as DiffId)
  }, [])
  useEffect(() => { sensRef.current = sensitivity; try { localStorage.setItem('d31_train_valsens', String(sensitivity)) } catch { /* noop */ } }, [sensitivity])
  useEffect(() => { try { localStorage.setItem('d31_train_diff', difficulty) } catch { /* noop */ } }, [difficulty])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const w = mount.clientWidth, h = mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))   // 레티나 2배는 픽셀 4배라 프레임 부담 → 1.5로 제한
    renderer.setSize(w, h)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a0a0e')
    const camera = new THREE.PerspectiveCamera(80, w / h, 0.1, 200)
    const SPAWN = new THREE.Vector3(0, 1.6, 44)
    camera.position.copy(SPAWN)

    // 1인칭 총 뷰모델
    const gunMat = new THREE.MeshLambertMaterial({ color: '#2a2a32' })
    const gun = new THREE.Group()
    const gPart = (sx: number, sy: number, sz: number, px: number, py: number, pz: number, rx = 0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), gunMat); m.position.set(px, py, pz); m.rotation.x = rx; gun.add(m)
    }
    gPart(0.11, 0.15, 0.5, 0, 0, 0)        // 총몸
    gPart(0.05, 0.055, 0.55, 0, 0.03, -0.48) // 총열
    gPart(0.09, 0.2, 0.12, 0, -0.16, 0.15, 0.22) // 손잡이
    gPart(0.075, 0.17, 0.1, 0, -0.16, 0)   // 탄창
    const GUN_Z = -0.7, GUN_RX = 0.02
    gun.position.set(0.28, -0.3, GUN_Z); gun.rotation.set(GUN_RX, -0.05, 0)
    camera.add(gun); scene.add(camera)
    let gunKick = 0

    // 바닥·그리드
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(14, 100), new THREE.MeshLambertMaterial({ color: '#222230' })).rotateX(-Math.PI / 2))
    const grid = new THREE.GridHelper(100, 100, 0x44445e, 0x2c2c3c); grid.position.y = 0.01; scene.add(grid)
    // 천장(실내 시가전 느낌)
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(14, 100), new THREE.MeshLambertMaterial({ color: '#17171f', side: THREE.DoubleSide }))
    ceiling.rotation.x = Math.PI / 2; ceiling.position.y = 11; scene.add(ceiling)

    // 벽(시가전 — 높게). walls = 시선 차단·가림 판정용
    const walls: THREE.Mesh[] = []
    const wallMat = new THREE.MeshLambertMaterial({ color: '#3a3a4e', side: THREE.DoubleSide })
    const wall = (x: number, y: number, z: number, sx: number, sy: number, sz: number, mat: THREE.Material = wallMat) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat); m.position.set(x, y, z); scene.add(m); walls.push(m); return m
    }
    wall(0, 6, -48, 14, 12, 0.4); wall(0, 6, 48, 14, 12, 0.4)   // 앞/뒤 벽
    wall(-7, 6, 0, 0.4, 12, 100); wall(7, 6, 0, 0.4, 12, 100)   // 좌/우 벽(높음)
    // 시가전 코너 — 좌우 번갈아 튀어나온 높은 벽(엄폐+은신). 촘촘하게 배치해 지그재그 통로를 만든다.
    const corners: Array<[number, number]> = [[-3.5, 34], [3.5, 22], [-3.5, 10], [3.5, -2], [-3.5, -14], [3.5, -26], [-3.5, -38]]
    for (const [x, z] of corners) wall(x, 5, z, 7, 10, 0.6)
    // 낮은 엄폐 박스(총격 엄폐) — 열린 통로 곳곳에
    const coverMat = new THREE.MeshLambertMaterial({ color: '#4a4a60' })
    const covers: Array<[number, number]> = [[3.5, 28], [-3.5, 16], [3.5, 4], [-3.5, -8], [3.5, -20], [-3.5, -32], [0, -44]]
    for (const [x, z] of covers) wall(x, 1.1, z, 2.2, 2.2, 2.2, coverMat)
    // 가는 기둥(디테일·부분 시야 차단) — 측벽 근처
    const pillarMat = new THREE.MeshLambertMaterial({ color: '#33333f' })
    const pillars: Array<[number, number]> = [[5.6, 30], [-5.6, 18], [5.6, 6], [-5.6, -6], [5.6, -18], [-5.6, -30]]
    for (const [x, z] of pillars) wall(x, 3.5, z, 0.5, 7, 0.5, pillarMat)

    // 사이트 표식(끝)
    const siteMark = new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 0.2), new THREE.MeshLambertMaterial({ color: '#00D2BE', emissive: '#00D2BE', emissiveIntensity: 0.6 }))
    siteMark.position.set(0, 3, -47.7); scene.add(siteMark)

    scene.add(new THREE.HemisphereLight(0xddddff, 0x3a3a4e, 2.4))
    const dirL = new THREE.DirectionalLight(0xffffff, 1.0); dirL.position.set(6, 16, 10); scene.add(dirL)
    // (통로 PointLight 4개 제거 — 동적 조명 수를 줄여 프래그먼트 셰이더 부하 감소)

    // 적 — 몸통(캡슐)+머리(구체) 분리. 머리 명중=헤드샷. fwd=감시 방향(+z). alive·alertAt 상태.
    type Enemy = { group: THREE.Group; body: THREE.Mesh; head: THREE.Mesh; mat: THREE.MeshLambertMaterial; alive: boolean; alertAt: number; fwd: THREE.Vector3 }
    const bodyGeo = new THREE.CapsuleGeometry(0.32, 1.0, 4, 8)
    const headGeo = new THREE.SphereGeometry(0.2, 16, 12)
    const enemies: Enemy[] = ENEMY_SPOTS.map(([x, z]) => {
      const mat = new THREE.MeshLambertMaterial({ color: '#c8323f', emissive: '#7a1620', emissiveIntensity: 0.3 })
      const body = new THREE.Mesh(bodyGeo, mat); body.position.y = 1.0
      const head = new THREE.Mesh(headGeo, mat); head.position.y = 1.85
      const group = new THREE.Group(); group.add(body, head); group.position.set(x, 0, z); scene.add(group)
      return { group, body, head, mat, alive: true, alertAt: 0, fwd: new THREE.Vector3(0, 0, 1) }
    })

    // 플래시(빛 구체) + 글로우 + 조명 + 꼬리
    const flashMat = new THREE.MeshLambertMaterial({ color: '#fffbe6', emissive: '#fff3b0', emissiveIntensity: 1 })
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), flashMat); flash.visible = false; scene.add(flash)
    const flashLight = new THREE.PointLight(0xffffff, 0, 16); scene.add(flashLight)
    const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 128
    const gctx = glowCanvas.getContext('2d')!
    const grd = gctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.22, 'rgba(255,255,255,0.6)'); grd.addColorStop(1, 'rgba(255,255,255,0)')
    gctx.fillStyle = grd; gctx.fillRect(0, 0, 128, 128)
    const glowTex = new THREE.CanvasTexture(glowCanvas)
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); glow.visible = false; scene.add(glow)
    const glowMat = glow.material as THREE.SpriteMaterial
    const TRAIL_N = 22
    const trailPos = new Float32Array(TRAIL_N * 3)
    const trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3))
    const trailMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })
    const trail = new THREE.Line(trailGeo, trailMat); trail.visible = false; trail.frustumCulled = false; scene.add(trail)
    const resetTrail = (v: THREE.Vector3) => { for (let i = 0; i < TRAIL_N; i++) { trailPos[i * 3] = v.x; trailPos[i * 3 + 1] = v.y; trailPos[i * 3 + 2] = v.z } trailGeo.attributes.position.needsUpdate = true }
    const pushTrail = (v: THREE.Vector3) => { for (let i = 0; i < TRAIL_N - 1; i++) { trailPos[i * 3] = trailPos[(i + 1) * 3]; trailPos[i * 3 + 1] = trailPos[(i + 1) * 3 + 1]; trailPos[i * 3 + 2] = trailPos[(i + 1) * 3 + 2] } trailPos[(TRAIL_N - 1) * 3] = v.x; trailPos[(TRAIL_N - 1) * 3 + 1] = v.y; trailPos[(TRAIL_N - 1) * 3 + 2] = v.z; trailGeo.attributes.position.needsUpdate = true }

    // 플래시 궤적
    const mO = new THREE.Vector3(), mE = new THREE.Vector3(), mC = new THREE.Vector3(), mB = new THREE.Vector3(), mTmp = new THREE.Vector3()
    const mN = new THREE.Vector3(), mS = new THREE.Vector3()
    const easeOut = (t: number) => 1 - (1 - t) * (1 - t)
    const motionPos = (m: Motion, p: number, out: THREE.Vector3) => {
      if (m === 'wall' || m === 'placed') { out.copy(mE); return }
      if (m === 'curve') { const it = 1 - p; out.set(mO.x * it * it + mC.x * 2 * it * p + mE.x * p * p, mO.y * it * it + mC.y * 2 * it * p + mE.y * p * p, mO.z * it * it + mC.z * 2 * it * p + mE.z * p * p); return }
      if (m === 'bounce') { if (p < 0.55) out.lerpVectors(mO, mB, p / 0.55); else out.lerpVectors(mB, mE, (p - 0.55) / 0.45); return }
      out.lerpVectors(mO, mE, easeOut(p))
    }

    // 시점(포인터락)
    const euler = new THREE.Euler(0, 0, 0, 'YXZ')
    // 발로란트 감도 공식: 회전 각도(도) = 마우스 카운트 × 감도 × 0.07(yaw). 라디안으로 적용.
    // 같은 마우스 DPI 기준으로 발로란트 게임 내 감도값과 동일한 조준이 된다.
    const VAL_YAW = 0.07, DEG2RAD = Math.PI / 180
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) return
      // 빠른 플릭(500 이하)은 그대로 반영하고, 극단적 스파이크만 상한으로 눌러 튐만 완화한다(버리지 않음).
      // euler를 지속 상태로 누적(매 이벤트 쿼터니언 역산 제거) → 더 안정적.
      const CAP = 500
      const mx = Math.max(-CAP, Math.min(CAP, e.movementX))
      const my = Math.max(-CAP, Math.min(CAP, e.movementY))
      const s = sensRef.current * VAL_YAW * DEG2RAD
      euler.y -= mx * s; euler.x -= my * s
      euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, euler.x)); camera.quaternion.setFromEuler(euler)
    }
    document.addEventListener('mousemove', onMouseMove)

    // 이동
    const keys = { w: false, a: false, s: false, d: false, shift: false, crouch: false, jump: false }
    const setKey = (c: string, v: boolean) => { if (c === 'KeyW') keys.w = v; else if (c === 'KeyS') keys.s = v; else if (c === 'KeyA') keys.a = v; else if (c === 'KeyD') keys.d = v; else if (c === 'ShiftLeft' || c === 'ShiftRight') keys.shift = v; else if (c === 'ControlLeft' || c === 'ControlRight') keys.crouch = v; else if (c === 'Space') keys.jump = v }
    const onKeyDown = (e: KeyboardEvent) => { if (document.pointerLockElement === renderer.domElement) { setKey(e.code, true); if (e.code === 'Space' || e.code === 'ControlLeft' || e.code === 'ControlRight') e.preventDefault() } }
    const onKeyUp = (e: KeyboardEvent) => setKey(e.code, false)
    document.addEventListener('keydown', onKeyDown); document.addEventListener('keyup', onKeyUp)

    // 시선 차단·가림 판정
    const frustum = new THREE.Frustum(), projMat = new THREE.Matrix4()
    const losRay = new THREE.Raycaster(), losDir = new THREE.Vector3()
    const blocked = (from: THREE.Vector3, to: THREE.Vector3) => {
      losDir.copy(to).sub(from); const d = losDir.length(); if (d < 0.001) return false
      losDir.multiplyScalar(1 / d); losRay.set(from, losDir); losRay.far = d - 0.4
      return losRay.intersectObjects(walls, false).length > 0
    }
    const isFlashed = () => {
      projMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); frustum.setFromProjectionMatrix(projMat)
      if (!frustum.containsPoint(flash.position)) return false
      return !blocked(camera.position, flash.position)
    }

    // 사격(레이캐스트)
    const shootRay = new THREE.Raycaster()
    const onMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement || e.button !== 0) return
      gunKick = 0.06
      gunShot()
      shootRay.setFromCamera(new THREE.Vector2(0, 0), camera)
      const parts: THREE.Mesh[] = []
      for (const en of enemies) if (en.alive) { parts.push(en.body, en.head) }
      const hit = shootRay.intersectObjects(parts, false)[0]
      if (hit) {
        const en = enemies.find((x) => x.body === hit.object || x.head === hit.object)
        if (en) {
          const isHead = hit.object === en.head
          en.alive = false; en.alertAt = 0; en.group.visible = false; g.kills++; setKills(g.kills)
          if (isHead) { g.headshots++; setHeadshots(g.headshots) }
          killSound(isHead)
          setHitKind(isHead ? 'head' : 'body')
          timers.push(window.setTimeout(() => setHitKind(null), 550))
        }
      }
    }
    document.addEventListener('mousedown', onMouseDown)

    // 사운드(전조 상승음)
    const beep = (dur: number) => {
      const a = audioRef.current; if (!a) return; const s = dur / 1000
      const o = a.createOscillator(), gn = a.createGain(); o.connect(gn); gn.connect(a.destination); o.type = 'sawtooth'
      o.frequency.setValueAtTime(200, a.currentTime); o.frequency.exponentialRampToValueAtTime(900, a.currentTime + s)
      gn.gain.setValueAtTime(0.001, a.currentTime); gn.gain.exponentialRampToValueAtTime(0.07, a.currentTime + s)
      o.start(); o.stop(a.currentTime + s + 0.02)
    }
    // 발사음(짧은 노이즈 버스트 + 저음 쿵)
    const gunShot = () => {
      const a = audioRef.current; if (!a) return; const t = a.currentTime
      const buf = a.createBuffer(1, Math.floor(a.sampleRate * 0.12), a.sampleRate)
      const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2)
      const src = a.createBufferSource(); src.buffer = buf
      const bp = a.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 2200
      const ng = a.createGain(); ng.gain.setValueAtTime(0.22, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
      src.connect(bp); bp.connect(ng); ng.connect(a.destination); src.start(t)
      const o = a.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.1)
      const og = a.createGain(); og.gain.setValueAtTime(0.18, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
      o.connect(og); og.connect(a.destination); o.start(t); o.stop(t + 0.12)
    }
    // 처치음(헤드샷이면 더 높고 밝게)
    const killSound = (head: boolean) => {
      const a = audioRef.current; if (!a) return; const t = a.currentTime
      const o = a.createOscillator(), gn = a.createGain(); o.type = 'triangle'
      o.frequency.setValueAtTime(head ? 950 : 620, t); o.frequency.exponentialRampToValueAtTime(head ? 1500 : 1040, t + 0.08)
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.2, t + 0.02); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      o.connect(gn); gn.connect(a.destination); o.start(t); o.stop(t + 0.2)
    }
    // 발소리(둔탁한 노이즈 — 뛸 때만 재생)
    const footstep = () => {
      const a = audioRef.current; if (!a) return; const t = a.currentTime
      const buf = a.createBuffer(1, Math.floor(a.sampleRate * 0.08), a.sampleRate)
      const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3)
      const src = a.createBufferSource(); src.buffer = buf
      const bp = a.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 650 + Math.random() * 250
      const ng = a.createGain(); ng.gain.setValueAtTime(0.11, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
      src.connect(bp); bp.connect(ng); ng.connect(a.destination); src.start(t)
    }

    // 미션 상태
    const g = { mission: 'idle' as Mission, fphase: 'off' as 'off' | 'arm' | 'tele', tStart: 0, ms: 600, motion: 'wall' as Motion, kills: 0, headshots: 0 }
    let timers: number[] = []
    const clearTimers = () => { timers.forEach((t) => clearTimeout(t)); timers = [] }
    const hideFlash = () => { flash.visible = false; trail.visible = false; glow.visible = false; flashLight.intensity = 0; setActiveFlash(null) }

    const endMission = (result: 'win' | 'lose', msg: string) => {
      if (g.mission !== 'playing') return
      g.mission = result; clearTimers(); hideFlash(); g.fphase = 'off'
      setMission(result); setMissionMsg(msg); setAlerted(false)
      if (result === 'lose' && msg.includes('섬광')) { setWhiteout(0.97); timers.push(window.setTimeout(() => setWhiteout(0), 300)) }
      document.exitPointerLock()
    }

    // 플래시 라운드
    const armFlash = () => { if (g.mission !== 'playing') return; g.fphase = 'arm'; timers.push(window.setTimeout(spawnFlash, ARM_MIN + Math.random() * ARM_RAND)) }
    const spawnFlash = () => {
      if (g.mission !== 'playing') return
      const f = FLASHES[Math.floor(Math.random() * FLASHES.length)]
      const px = camera.position.x, pz = camera.position.z

      // 플래시 앵커 = 진행 방향(-z) 앞쪽 6~10m의 통로 지점(좌우 랜덤).
      // 플레이어 시선과 무관 → 옆·뒤를 보면 회피. 단, 사이에 벽이 있으면 벽 앞(0.8 여유)에서
      // 멈춰서 촘촘한 벽 사이에서도 항상 보이게 한다(벽에 가려 안 나오는 문제 방지).
      let ax = Math.max(-5.5, Math.min(5.5, px + (Math.random() * 2 - 1) * 3.5))
      let az = pz - (6 + Math.random() * 4)
      mTmp.set(ax - px, 0, az - pz); const adist = mTmp.length() || 1; mTmp.divideScalar(adist)
      losRay.set(mB.set(px, 1.5, pz), mTmp); losRay.far = adist
      const wallHit = losRay.intersectObjects(walls, false)[0]
      if (wallHit && wallHit.distance < adist - 0.1) {
        const dd = Math.max(3, wallHit.distance - 0.8)
        ax = px + mTmp.x * dd; az = pz + mTmp.z * dd
      }
      mE.set(ax, 1.5, az)

      // 옆방향(아치·벽 계산용) — 시작점이 측벽 밖으로 나가지 않도록 통로 안쪽 부호 선택
      mS.set(-mTmp.z, 0, mTmp.x)
      let sgn = Math.random() < 0.5 ? 1 : -1
      if (Math.abs(ax + mS.x * sgn * 2) > 6.2) sgn = -sgn

      g.motion = f.motion
      if (f.motion === 'wall') {
        // 브리치 — 앵커에서 사방(±x·±z)으로 탐색해 가장 가까운 벽면에서 팝(반드시 벽에서 나온다).
        let bestD = Infinity, bnx = 0, bnz = 0, bpx = 0, bpz = 0
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          mN.set(dx, 0, dz); losRay.set(mB.set(ax, 1.5, az), mN); losRay.far = 9
          const wh = losRay.intersectObjects(walls, false)[0]
          if (wh && wh.distance < bestD) { bestD = wh.distance; bnx = dx; bnz = dz; bpx = wh.point.x; bpz = wh.point.z }
        }
        if (bestD < Infinity) mE.set(bpx - bnx * 0.06, 1.4 + Math.random() * 0.5, bpz - bnz * 0.06)
      } else if (f.motion === 'curve') {
        // 피닉스 — 앵커로 위·옆 짧은 아치(궤적이 앵커 열린공간 근처 → 관통 없음)
        mO.copy(mE).addScaledVector(mS, 2.0 * sgn); mO.y = 2.6
        mC.copy(mE).addScaledVector(mS, 1.1 * sgn); mC.y = 3.2
      }
      // 바이스(placed) — mE 그 자리(공중 부유 설치) 정적
      const staticStart = f.motion !== 'curve'
      flash.position.copy(staticStart ? mE : mO); flash.visible = true; flash.scale.setScalar(staticStart ? 0.2 : 0.4)
      flashMat.color.set(f.color); flashMat.emissive.set(f.color)
      flashLight.color.set(f.color); flashLight.position.copy(flash.position)
      glowMat.color.set(f.color); glow.position.copy(flash.position); glow.visible = true
      trailMat.color.set(f.color); resetTrail(flash.position); trail.visible = !staticStart
      g.fphase = 'tele'; g.tStart = performance.now(); g.ms = f.ms
      setActiveFlash(f); beep(f.ms)
      timers.push(window.setTimeout(detonate, f.ms))
    }
    const detonate = () => {
      if (g.mission !== 'playing') return
      const caught = isFlashed(); hideFlash(); g.fphase = 'off'
      if (caught) { endMission('lose', '섬광에 시야를 잃었습니다'); return }
      armFlash()
    }

    const startMission = () => {
      clearTimers(); hideFlash(); setWhiteout(0)   // 재시작 시 섬광 화이트아웃 확실히 제거
      camera.position.copy(SPAWN); euler.set(0, 0, 0, 'YXZ'); camera.quaternion.setFromEuler(euler)
      eyeY = STAND_EYE; velY = 0; onGround = true; stepAccum = 0
      for (const en of enemies) { en.alive = true; en.alertAt = 0; en.group.visible = true }
      g.kills = 0; g.headshots = 0; setKills(0); setHeadshots(0); setHitKind(null); setAlerted(false); g.mission = 'playing'; setMission('playing')
      armFlash()
    }

    const onLockChange = () => {
      const on = document.pointerLockElement === renderer.domElement
      setLocked(on)
      if (on) { if (g.mission !== 'playing') startMission() }
      else { if (g.mission === 'playing') { g.mission = 'idle'; setMission('idle') } clearTimers(); hideFlash(); g.fphase = 'off'; keys.w = keys.a = keys.s = keys.d = keys.shift = keys.crouch = keys.jump = false; setAlerted(false); setHitKind(null) }
    }
    document.addEventListener('pointerlockchange', onLockChange)
    const onLockErr = () => setLockError(true)
    document.addEventListener('pointerlockerror', onLockErr)

    // 루프
    const clock = new THREE.Clock()
    const fwd = new THREE.Vector3(), right = new THREE.Vector3(), mv = new THREE.Vector3(), eEye = new THREE.Vector3(), eToP = new THREE.Vector3()
    let prevAlert = false
    let sightAccum = 0
    let eyeY = STAND_EYE, velY = 0, onGround = true, stepAccum = 0
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(clock.getDelta(), 0.05)
      const playing = g.mission === 'playing' && document.pointerLockElement === renderer.domElement

      if (playing) {
        // 수평 이동
        camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize(); right.crossVectors(fwd, camera.up).normalize()
        mv.set(0, 0, 0)
        if (keys.w) mv.add(fwd); if (keys.s) mv.sub(fwd); if (keys.d) mv.add(right); if (keys.a) mv.sub(right)
        const moving = mv.lengthSq() > 0
        if (moving) {
          const spd = keys.shift ? SPEED * WALK_MULT : keys.crouch ? SPEED * CROUCH_MULT : SPEED
          mv.normalize().multiplyScalar(spd * dt)
          camera.position.x = Math.max(-BOUND_X, Math.min(BOUND_X, camera.position.x + mv.x))
          camera.position.z = Math.max(-BOUND_Z, Math.min(BOUND_Z, camera.position.z + mv.z))
        }
        // 수직 — 점프(Space)·중력·앉기(Ctrl 눈높이)
        const targetEye = keys.crouch ? CROUCH_EYE : STAND_EYE
        if (keys.jump && onGround) { velY = JUMP_V; onGround = false }
        if (!onGround) {
          velY += GRAVITY * dt; eyeY += velY * dt
          if (eyeY <= targetEye) { eyeY = targetEye; velY = 0; onGround = true }
        } else {
          eyeY += (targetEye - eyeY) * Math.min(1, dt * 12)   // 앉기/서기 부드럽게
        }
        camera.position.y = eyeY
        // 발소리 — 지상에서 '뛸 때'만(Shift 걷기·Ctrl 앉기·공중이면 조용)
        if (onGround && moving && !keys.shift && !keys.crouch) {
          stepAccum += dt; if (stepAccum >= 0.34) { stepAccum = 0; footstep() }
        } else stepAccum = 0
        // 도달 성공
        if (camera.position.z < WIN_Z) { endMission('win', '사이트 도달 — 미션 성공'); }
      }

      if (g.mission === 'playing') {
        const now = performance.now()
        // 적 발각 판정 — 매 프레임 대신 ~45ms 간격으로 스로틀(레이캐스트 부하 절감, 반응성엔 영향 없음)
        sightAccum += dt
        if (sightAccum >= 0.045) {
          sightAccum = 0
          let anyAlert = false
          for (const en of enemies) {
            if (!en.alive) continue
            eEye.copy(en.group.position); eEye.y = 1.5
            eToP.copy(camera.position).sub(en.group.position); eToP.y = 0
            const d = eToP.length()
            let sees = false
            if (d < SIGHT_RANGE && d > 0.1) {
              eToP.multiplyScalar(1 / d)
              if (en.fwd.x * eToP.x + en.fwd.z * eToP.z > SIGHT_DOT && !blocked(eEye, camera.position)) sees = true
            }
            if (sees) {
              if (en.alertAt === 0) en.alertAt = now
              else if (now - en.alertAt > REACT_MS) { endMission('lose', '적에게 제압당했습니다'); break }
              anyAlert = true
            } else en.alertAt = 0
            // 발각된 적은 밝게
            en.mat.emissiveIntensity = en.alertAt ? 0.6 + 0.4 * Math.sin(now * 0.02) : 0.3
          }
          if (anyAlert !== prevAlert) { prevAlert = anyAlert; setAlerted(anyAlert) }
        }

        // 플래시 전조 애니메이션
        if (g.fphase === 'tele') {
          const p = Math.min(1, (now - g.tStart) / g.ms)
          motionPos(g.motion, p, mTmp); flash.position.copy(mTmp)
          const k = 0.5 + 0.5 * Math.sin(now * 0.02)
          const grow = (g.motion === 'wall' || g.motion === 'placed') ? 0.2 + p * 0.6 : 0
          flash.scale.setScalar(0.5 + k * 0.3 + grow * 0.6); flashMat.emissiveIntensity = 1.5 + k * 3
          if (trail.visible) pushTrail(flash.position)
          flashLight.position.copy(flash.position); flashLight.intensity = 1.6 + k * 2
          glow.position.copy(flash.position); glow.scale.setScalar(1.3 + grow + k * 0.7)
        }
      }
      // 총 반동
      gunKick *= 0.86; gun.position.z = GUN_Z + gunKick * 1.4; gun.rotation.x = GUN_RX + gunKick * 2.6
      renderer.render(scene, camera)
    }
    loop()

    const onResize = () => { const nw = mount.clientWidth, nh = mount.clientHeight; camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh) }
    window.addEventListener('resize', onResize)
    // 전체화면 전환 시 컨테이너 높이·렌더 크기 갱신
    const onFsChange = () => { mount.style.height = document.fullscreenElement === mount ? '100%' : '480px'; onResize() }
    document.addEventListener('fullscreenchange', onFsChange)

    return () => {
      cancelAnimationFrame(raf); clearTimers()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('keydown', onKeyDown); document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('mousedown', onMouseDown); document.removeEventListener('pointerlockchange', onLockChange); document.removeEventListener('pointerlockerror', onLockErr)
      document.removeEventListener('fullscreenchange', onFsChange)
      renderer.dispose(); trailGeo.dispose(); glowTex.dispose(); bodyGeo.dispose(); headGeo.dispose()
      for (const en of enemies) en.mat.dispose()
      gun.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose() }); gunMat.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [])

  const requestLock = useCallback(() => {
    if (!audioRef.current) { try { audioRef.current = new AudioContext() } catch { /* noop */ } }
    audioRef.current?.resume()
    const mountEl = mountRef.current
    const canvas = mountEl?.querySelector('canvas'); if (!canvas) return
    setLockError(false)
    // 전체화면(가능하면) — 작은 화면 답답함 해결
    if (mountEl?.requestFullscreen && !document.fullscreenElement) mountEl.requestFullscreen().catch(() => {})
    try { const ret = canvas.requestPointerLock() as unknown as Promise<void> | undefined; if (ret && typeof ret.catch === 'function') ret.catch(() => setLockError(true)) } catch { setLockError(true) }
  }, [])

  const overlayTitle = mission === 'win' ? '미션 성공! 🎉' : mission === 'lose' ? '미션 실패' : '시가전 미션'
  const overlaySub = mission === 'win' ? '아래에서 다시 도전할 수 있어요.'
    : mission === 'lose' ? missionMsg
    : '통로를 전진해 끝(사이트)까지 도달하세요. 구석의 적이 보면 즉시 제압, 플래시는 등 돌려 회피.'

  return (
    <div className="flex flex-col gap-3">
      <div ref={mountRef} className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0e]" style={{ height: 480 }}>
        <div className="absolute inset-0 z-20 pointer-events-none bg-white" style={{ opacity: whiteout, transition: 'opacity 0.45s ease-out' }} />

        {locked && (
          <>
            <div className="absolute top-3 left-3 z-10 text-xs font-bold text-white/90 bg-black/40 rounded px-2 py-1">처치 {kills} · <span className="text-[#ffd700]">헤드샷 {headshots}</span></div>
            {alerted && <div className="absolute top-3 right-3 z-10 text-xs font-black text-white bg-[#ff4655] rounded px-2 py-1 animate-pulse">⚠ 발각! 제압하라</div>}
            {alerted && <div className="absolute inset-0 z-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 90px 20px rgba(255,70,85,0.4)' }} />}
            {activeFlash && (
              <div className="absolute top-12 left-1/2 z-10 -translate-x-1/2 flex items-center gap-2 bg-black/55 rounded-lg px-3 py-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={agentIcon(activeFlash.agent) ?? ''} alt={activeFlash.agent} className="w-7 h-7 rounded object-cover" />
                <div className="leading-tight"><div className="text-xs font-black text-white">{activeFlash.agent}</div><div className="text-[10px] text-[#ffd700]">{activeFlash.flash}</div></div>
              </div>
            )}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#00D2BE] shadow" />
            {hitKind && (
              <div className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-[190%] text-sm font-black ${hitKind === 'head' ? 'text-[#ffd700]' : 'text-white'}`}>
                {hitKind === 'head' ? 'HEADSHOT!' : '명중'}
              </div>
            )}
            <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[11px] text-white/50">WASD 이동 · Shift 걷기 · Ctrl 앉기 · Space 점프 · 클릭 사격(머리=헤드샷) · 플래시 등 돌려 회피 · ESC 종료</div>
          </>
        )}

        {!locked && (
          <>
            {/* 우측 게임 메뉴(발로란트식) */}
            <div className={`absolute inset-0 z-30 flex items-center justify-end px-8 text-white bg-gradient-to-l to-transparent ${mission === 'win' ? 'from-[#04342c]/90 via-[#04342c]/40' : mission === 'lose' ? 'from-[#3a0d12]/90 via-[#3a0d12]/40' : 'from-black/80 via-black/40'}`}>
              <div className="flex flex-col items-end gap-2.5 w-52">
                <div className="text-right mb-2">
                  <div className="text-2xl font-black leading-tight">{overlayTitle}</div>
                  <div className="text-xs text-slate-300 mt-1">{overlaySub}</div>
                </div>
                <button onClick={requestLock} className="w-full px-5 py-3 rounded-md bg-[#00D2BE] hover:bg-[#00b8a6] text-black font-black text-sm text-right transition cursor-pointer">
                  {mission === 'idle' ? '게임 시작' : '다시 도전'}
                </button>
                <button onClick={() => setShowSettings(true)} className="w-full px-5 py-3 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-sm text-right transition cursor-pointer">
                  설정
                </button>
                {lockError && <div className="text-xs text-[#ff4655] mt-2 text-right leading-relaxed">이 미리보기(iframe)에선 마우스 잠금이 막혀 있어요. 새 탭에서 <b>localhost:3000/valorant/training</b> 을 직접 열어 플레이하세요.</div>}
              </div>
            </div>

            {/* 설정 모달 */}
            {showSettings && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 px-6" onClick={() => setShowSettings(false)}>
                <div className="w-80 bg-[#14141b] border border-white/10 rounded-xl p-5 flex flex-col gap-4 text-left" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black text-white">설정</div>
                    <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white text-lg leading-none cursor-pointer">✕</button>
                  </div>

                  {/* 난이도(명목상) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="text-[11px] font-bold text-white/80">난이도</div>
                    <div className="grid grid-cols-4 gap-1">
                      {DIFFICULTIES.map((d) => (
                        <button key={d.id} onClick={() => setDifficulty(d.id)}
                          className={`py-1.5 rounded-md text-[11px] font-bold transition ${difficulty === d.id ? `${d.active} text-white` : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                    <div className="text-[10px] text-white/40 min-h-[14px]">{DIFFICULTIES.find((d) => d.id === difficulty)?.desc}</div>
                  </div>

                  {/* 감도 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]"><span className="font-bold text-white/80">발로란트 감도</span><span className="text-[#00D2BE] font-mono">{sensitivity.toFixed(3)}</span></div>
                    <input type="range" min={0.1} max={1} step={0.005} value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))} className="w-full accent-[#00D2BE] cursor-pointer" />
                    <div className="text-[10px] text-white/40">발로 게임 내 감도값 그대로 입력 (같은 마우스 DPI 기준 동일)</div>
                  </div>

                  <button onClick={() => setShowSettings(false)} className="mt-1 w-full py-2 rounded-md bg-[#00D2BE] hover:bg-[#00b8a6] text-black font-black text-xs transition cursor-pointer">확인</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <p className="text-[11px] text-slate-600">자체 디자인 그레이박스(특정 맵 복제 아님) — 시가전 통로를 전진하며 구석의 적을 제압하고(보이면 빨리!), 피닉스·바이스·브리치 플래시를 등 돌려 피해 끝까지 도달하면 성공.</p>
    </div>
  )
}
