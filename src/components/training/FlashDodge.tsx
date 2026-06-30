'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { agentIcon } from '@/lib/valorantAgents'

// 모드 2: 3D 시가전 미션 — 좁고 긴 시가지 통로를 전진하며, 구석에 숨은 적이 나를 보면
// 제한시간 내 제압해야 한다(못하면 실패). 동시에 플래시(피닉스·바이스·브리치)를 등 돌려 피하며
// 끝(사이트)까지 안 죽고 도달하면 성공. 마우스 시점=포인터락. ※ 지형·총·플래시 전부 자체 그래픽(IP 회피).

const SPEED = 7
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

// 적 배치(구석·엄폐 뒤) [x,z] — 전부 +z(접근로) 감시
const ENEMY_SPOTS: Array<[number, number]> = [[-4, 21], [4, 5], [-4, -11], [4, -27], [-4, -41], [3, -45]]

type Mission = 'idle' | 'playing' | 'win' | 'lose'

export default function FlashDodge() {
  const mountRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const [locked, setLocked] = useState(false)
  const [lockError, setLockError] = useState(false)
  const [mission, setMission] = useState<Mission>('idle')
  const [missionMsg, setMissionMsg] = useState('')
  const [kills, setKills] = useState(0)
  const [alerted, setAlerted] = useState(false)
  const [activeFlash, setActiveFlash] = useState<Flash | null>(null)
  const [whiteout, setWhiteout] = useState(0)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const w = mount.clientWidth, h = mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a0a0e')
    const camera = new THREE.PerspectiveCamera(80, w / h, 0.1, 200)
    const SPAWN = new THREE.Vector3(0, 1.6, 44)
    camera.position.copy(SPAWN)

    // 1인칭 총 뷰모델
    const gunMat = new THREE.MeshStandardMaterial({ color: '#2a2a32', roughness: 0.55, metalness: 0.35 })
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
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(14, 100), new THREE.MeshStandardMaterial({ color: '#222230', roughness: 1 })).rotateX(-Math.PI / 2))
    const grid = new THREE.GridHelper(100, 100, 0x44445e, 0x2c2c3c); grid.position.y = 0.01; scene.add(grid)

    // 벽(시가전 — 높게). walls = 시선 차단·가림 판정용
    const walls: THREE.Mesh[] = []
    const wallMat = new THREE.MeshStandardMaterial({ color: '#3a3a4e', roughness: 1, side: THREE.DoubleSide })
    const wall = (x: number, y: number, z: number, sx: number, sy: number, sz: number, mat: THREE.Material = wallMat) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat); m.position.set(x, y, z); scene.add(m); walls.push(m); return m
    }
    wall(0, 6, -48, 14, 12, 0.4); wall(0, 6, 48, 14, 12, 0.4)   // 앞/뒤 벽
    wall(-7, 6, 0, 0.4, 12, 100); wall(7, 6, 0, 0.4, 12, 100)   // 좌/우 벽(높음)
    // 시가전 코너 — 좌우 번갈아 튀어나온 높은 벽(엄폐+은신)
    wall(-3.5, 5, 24, 7, 10, 0.6); wall(3.5, 5, 8, 7, 10, 0.6); wall(-3.5, 5, -8, 7, 10, 0.6)
    wall(3.5, 5, -24, 7, 10, 0.6); wall(-3.5, 5, -38, 7, 10, 0.6)
    // 낮은 엄폐 박스
    const coverMat = new THREE.MeshStandardMaterial({ color: '#4a4a60', roughness: 1 })
    wall(4, 1.2, 18, 2, 2.4, 2, coverMat); wall(-4, 1.2, -2, 2, 2.4, 2, coverMat); wall(4, 1.2, -32, 2, 2.4, 2, coverMat)

    // 사이트 표식(끝)
    const siteMark = new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 0.2), new THREE.MeshStandardMaterial({ color: '#00D2BE', emissive: '#00D2BE', emissiveIntensity: 0.6 }))
    siteMark.position.set(0, 3, -47.7); scene.add(siteMark)

    scene.add(new THREE.HemisphereLight(0xddddff, 0x3a3a4e, 1.7))
    const dirL = new THREE.DirectionalLight(0xffffff, 0.9); dirL.position.set(6, 16, 10); scene.add(dirL)
    for (const lz of [38, 14, -10, -34]) { const pl = new THREE.PointLight(0xffffff, 0.5, 46); pl.position.set(0, 7, lz); scene.add(pl) }

    // 적 — 캡슐. fwd=감시 방향(+z). alive·alertAt 상태.
    type Enemy = { mesh: THREE.Mesh; alive: boolean; alertAt: number; fwd: THREE.Vector3 }
    const enemyGeo = new THREE.CapsuleGeometry(0.35, 1.1, 4, 8)
    const enemies: Enemy[] = ENEMY_SPOTS.map(([x, z]) => {
      const mesh = new THREE.Mesh(enemyGeo, new THREE.MeshStandardMaterial({ color: '#c8323f', emissive: '#7a1620', emissiveIntensity: 0.3, roughness: 0.8 }))
      mesh.position.set(x, 1.05, z); scene.add(mesh)
      return { mesh, alive: true, alertAt: 0, fwd: new THREE.Vector3(0, 0, 1) }
    })

    // 플래시(빛 구체) + 글로우 + 조명 + 꼬리
    const flashMat = new THREE.MeshStandardMaterial({ color: '#fffbe6', emissive: '#fff3b0', emissiveIntensity: 1 })
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
    const easeOut = (t: number) => 1 - (1 - t) * (1 - t)
    const motionPos = (m: Motion, p: number, out: THREE.Vector3) => {
      if (m === 'wall' || m === 'placed') { out.copy(mE); return }
      if (m === 'curve') { const it = 1 - p; out.set(mO.x * it * it + mC.x * 2 * it * p + mE.x * p * p, mO.y * it * it + mC.y * 2 * it * p + mE.y * p * p, mO.z * it * it + mC.z * 2 * it * p + mE.z * p * p); return }
      if (m === 'bounce') { if (p < 0.55) out.lerpVectors(mO, mB, p / 0.55); else out.lerpVectors(mB, mE, (p - 0.55) / 0.45); return }
      out.lerpVectors(mO, mE, easeOut(p))
    }

    // 시점(포인터락)
    const euler = new THREE.Euler(0, 0, 0, 'YXZ')
    const SENS = 0.0022
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) return
      euler.setFromQuaternion(camera.quaternion); euler.y -= e.movementX * SENS; euler.x -= e.movementY * SENS
      euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, euler.x)); camera.quaternion.setFromEuler(euler)
    }
    document.addEventListener('mousemove', onMouseMove)

    // 이동
    const keys = { w: false, a: false, s: false, d: false }
    const setKey = (c: string, v: boolean) => { if (c === 'KeyW') keys.w = v; else if (c === 'KeyS') keys.s = v; else if (c === 'KeyA') keys.a = v; else if (c === 'KeyD') keys.d = v }
    const onKeyDown = (e: KeyboardEvent) => { if (document.pointerLockElement === renderer.domElement) setKey(e.code, true) }
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
      shootRay.setFromCamera(new THREE.Vector2(0, 0), camera)
      const live = enemies.filter((en) => en.alive).map((en) => en.mesh)
      const hit = shootRay.intersectObjects(live, false)[0]
      if (hit) {
        const en = enemies.find((x) => x.mesh === hit.object)
        if (en) { en.alive = false; en.alertAt = 0; en.mesh.visible = false; g.kills++; setKills(g.kills) }
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

    // 미션 상태
    const g = { mission: 'idle' as Mission, fphase: 'off' as 'off' | 'arm' | 'tele', tStart: 0, ms: 600, motion: 'wall' as Motion, kills: 0 }
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
      const ex0 = camera.position.x, ez0 = camera.position.z
      camera.getWorldDirection(mTmp); mTmp.y = 0; if (mTmp.lengthSq() < 1e-4) mTmp.set(0, 0, -1); mTmp.normalize()
      losRay.set(new THREE.Vector3(ex0, 1.6, ez0), mTmp); losRay.far = 24
      const hit = losRay.intersectObjects(walls, false)[0]
      let dist = 7 + Math.random() * 4
      if (hit && hit.distance - 1.6 < dist) dist = Math.max(3.5, hit.distance - 1.6)
      const ex = ex0 + mTmp.x * dist, ez = ez0 + mTmp.z * dist, ty = 1.5 + Math.random() * 0.8
      mE.set(ex, ty, ez)
      const fd = dist + 5, fx = ex0 + mTmp.x * fd, fz = ez0 + mTmp.z * fd
      const sx = -mTmp.z, sz = mTmp.x, sgn = Math.random() < 0.5 ? 1 : -1
      g.motion = f.motion
      if (f.motion === 'curve') { mO.set(fx + sx * 3 * sgn, 1.4, fz + sz * 3 * sgn); mC.set((ex + fx) / 2 + sx * 1.5 * sgn, 3.8, (ez + fz) / 2 + sz * 1.5 * sgn) }
      const staticStart = f.motion === 'wall' || f.motion === 'placed'
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
      clearTimers(); hideFlash()
      camera.position.copy(SPAWN); euler.set(0, 0, 0, 'YXZ'); camera.quaternion.setFromEuler(euler)
      for (const en of enemies) { en.alive = true; en.alertAt = 0; en.mesh.visible = true }
      g.kills = 0; setKills(0); setAlerted(false); g.mission = 'playing'; setMission('playing')
      armFlash()
    }

    const onLockChange = () => {
      const on = document.pointerLockElement === renderer.domElement
      setLocked(on)
      if (on) { if (g.mission !== 'playing') startMission() }
      else { if (g.mission === 'playing') { g.mission = 'idle'; setMission('idle') } clearTimers(); hideFlash(); g.fphase = 'off'; keys.w = keys.a = keys.s = keys.d = false; setAlerted(false) }
    }
    document.addEventListener('pointerlockchange', onLockChange)
    const onLockErr = () => setLockError(true)
    document.addEventListener('pointerlockerror', onLockErr)

    // 루프
    const clock = new THREE.Clock()
    const fwd = new THREE.Vector3(), right = new THREE.Vector3(), mv = new THREE.Vector3(), eEye = new THREE.Vector3(), eToP = new THREE.Vector3()
    let prevAlert = false
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(clock.getDelta(), 0.05)
      const playing = g.mission === 'playing' && document.pointerLockElement === renderer.domElement

      if (playing) {
        // 이동
        camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize(); right.crossVectors(fwd, camera.up).normalize()
        mv.set(0, 0, 0)
        if (keys.w) mv.add(fwd); if (keys.s) mv.sub(fwd); if (keys.d) mv.add(right); if (keys.a) mv.sub(right)
        if (mv.lengthSq() > 0) {
          mv.normalize().multiplyScalar(SPEED * dt)
          camera.position.x = Math.max(-BOUND_X, Math.min(BOUND_X, camera.position.x + mv.x))
          camera.position.z = Math.max(-BOUND_Z, Math.min(BOUND_Z, camera.position.z + mv.z))
          camera.position.y = 1.6
        }
        // 도달 성공
        if (camera.position.z < WIN_Z) { endMission('win', '사이트 도달 — 미션 성공'); }
      }

      if (g.mission === 'playing') {
        // 적 발각 판정
        const now = performance.now()
        let anyAlert = false
        for (const en of enemies) {
          if (!en.alive) continue
          eEye.copy(en.mesh.position); eEye.y = 1.5
          eToP.copy(camera.position).sub(en.mesh.position); eToP.y = 0
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
          const mat = en.mesh.material as THREE.MeshStandardMaterial
          mat.emissiveIntensity = en.alertAt ? 0.6 + 0.4 * Math.sin(now * 0.02) : 0.3
        }
        if (anyAlert !== prevAlert) { prevAlert = anyAlert; setAlerted(anyAlert) }

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

    return () => {
      cancelAnimationFrame(raf); clearTimers()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('keydown', onKeyDown); document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('mousedown', onMouseDown); document.removeEventListener('pointerlockchange', onLockChange); document.removeEventListener('pointerlockerror', onLockErr)
      renderer.dispose(); trailGeo.dispose(); glowTex.dispose(); enemyGeo.dispose()
      gun.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose() }); gunMat.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [])

  const requestLock = useCallback(() => {
    if (!audioRef.current) { try { audioRef.current = new AudioContext() } catch { /* noop */ } }
    audioRef.current?.resume()
    const canvas = mountRef.current?.querySelector('canvas'); if (!canvas) return
    setLockError(false)
    try { const ret = canvas.requestPointerLock() as unknown as Promise<void> | undefined; if (ret && typeof ret.catch === 'function') ret.catch(() => setLockError(true)) } catch { setLockError(true) }
  }, [])

  const overlayTitle = mission === 'win' ? '미션 성공! 🎉' : mission === 'lose' ? '미션 실패' : '시가전 미션'
  const overlaySub = mission === 'win' ? '클릭하여 다시 도전'
    : mission === 'lose' ? `${missionMsg} · 클릭하여 재시작`
    : '통로를 전진해 끝(사이트)까지 도달하세요. 구석의 적이 보면 즉시 제압, 플래시는 등 돌려 회피. 클릭하여 시작.'

  return (
    <div className="flex flex-col gap-3">
      <div ref={mountRef} className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0e]" style={{ height: 480 }}>
        <div className="absolute inset-0 z-20 pointer-events-none bg-white" style={{ opacity: whiteout, transition: 'opacity 0.45s ease-out' }} />

        {locked && (
          <>
            <div className="absolute top-3 left-3 z-10 text-xs font-bold text-white/90 bg-black/40 rounded px-2 py-1">처치 {kills}</div>
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
            <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[11px] text-white/50">WASD 이동 · 클릭 사격 · 플래시 등 돌려 회피 · 끝까지 도달 · ESC 종료</div>
          </>
        )}

        {!locked && (
          <button onClick={requestLock} className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 cursor-pointer px-6 text-center ${mission === 'win' ? 'bg-[#04342c]/80' : mission === 'lose' ? 'bg-[#3a0d12]/85' : 'bg-black/55'} text-white`}>
            <div className="text-3xl font-black">{overlayTitle}</div>
            <div className="text-sm text-slate-200 max-w-md">{overlaySub}</div>
            {lockError && <div className="text-xs text-[#ff4655] mt-2 max-w-md leading-relaxed">이 미리보기(iframe)에선 마우스 잠금이 막혀 있어요. 새 탭에서 <b>localhost:3000/valorant/training</b> 을 직접 열어 플레이하세요.</div>}
          </button>
        )}
      </div>
      <p className="text-[11px] text-slate-600">자체 디자인 그레이박스(특정 맵 복제 아님) — 시가전 통로를 전진하며 구석의 적을 제압하고(보이면 빨리!), 피닉스·바이스·브리치 플래시를 등 돌려 피해 끝까지 도달하면 성공.</p>
    </div>
  )
}
