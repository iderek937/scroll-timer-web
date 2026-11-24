import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

const MIN = 1
const MAX = 90
const INTRO_END = 10
const VALUES = Array.from({ length: MAX - MIN + 1 }, (_, index) => MAX - index)
const ALL_VALUES = [...VALUES]

type Engine = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  rail: THREE.Group
  groups: Map<number, THREE.Group>
  materials: Map<number, THREE.MeshStandardMaterial>
  baseY: Map<number, number>
  geometries: THREE.BufferGeometry[]
  digitHeight: number
  shadow: THREE.ShadowMaterial
  pxPerUnit: number
  spacing: number
  scaleX: number
  scaleY: number
}

const pad = (value: number) => String(value).padStart(2, '0')

let introDone = false

export function Scroller3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const activeRef = useRef(INTRO_END)
  const selectedRef = useRef(INTRO_END)
  const modeRef = useRef<'scroll' | 'timer'>('scroll')
  const targetRef = useRef(0)
  const progressRef = useRef(0)

  const [active, setActive] = useState(INTRO_END)
  const [mode, setMode] = useState<'scroll' | 'timer'>('scroll')
  const [remaining, setRemaining] = useState(0)
  const [itemHeight, setItemHeight] = useState(() => Math.round(window.innerHeight * 0.77))
  const [digitHalf, setDigitHalf] = useState(() => Math.round(window.innerHeight * 0.31))

  useEffect(() => {
    activeRef.current = active
  }, [active])

  const centerValue = useCallback((value: number) => {
    const engine = engineRef.current
    const list = listRef.current
    if (!engine || !list) return
    const top = (MAX - value) * engine.spacing * engine.pxPerUnit
    list.scrollTop = top
    engine.rail.position.y = top / engine.pxPerUnit
  }, [])

  useEffect(() => {
    const host = mountRef.current
    const list = listRef.current
    if (!host || !list) return

    let disposed = false
    let frame = 0
    let introFrame = 0

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 0, 12)

    // Light comes from the top-centre/right, so shadows fall down and to the left.
    scene.add(new THREE.AmbientLight(0xffffff, 1.1))
    const key = new THREE.DirectionalLight(0xffffff, 2.1)
    key.position.set(5, 7, 9)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = -12
    key.shadow.camera.right = 12
    key.shadow.camera.top = 12
    key.shadow.camera.bottom = -12
    key.shadow.bias = -0.0008
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xc7d2fe, 0.45)
    fill.position.set(-6, -4, 6)
    scene.add(fill)

    const shadow = new THREE.ShadowMaterial({ color: '#64748b', opacity: 0.12 })
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), shadow)
    backdrop.position.z = -1.8
    backdrop.receiveShadow = true
    scene.add(backdrop)

    const rail = new THREE.Group()
    scene.add(rail)

    const wheelColor = new THREE.Color('#f8fafc')
    const timerColor = new THREE.Color('#0b0b0d')
    const currentColor = new THREE.Color()
    const baseGlow = new THREE.Color('#000000')
    const accentGlow = new THREE.Color('#1e1b4b')
    const wheelShadow = new THREE.Color('#64748b')
    const timerShadow = new THREE.Color('#000000')

    const layout = () => {
      const engine = engineRef.current
      if (!engine) return

      const width = window.innerWidth
      const height = window.innerHeight
      engine.renderer.setSize(width, height)
      engine.camera.aspect = width / height
      engine.camera.updateProjectionMatrix()

      const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(engine.camera.fov / 2)) * engine.camera.position.z
      const visibleWidth = visibleHeight * engine.camera.aspect
      const narrow = width <= 600 ? 0.82 : 0.9
      const maxWidth = (width <= 600 ? 0.74 : 0.86) * visibleWidth
      const scale = Math.min(
        (0.62 * visibleHeight) / engine.digitHeight,
        maxWidth / (engine.groups.get(88)!.userData.width * narrow),
      )

      engine.pxPerUnit = height / visibleHeight
      engine.spacing = engine.digitHeight * scale * 1.25
      engine.scaleX = scale * narrow
      engine.scaleY = scale

      engine.groups.forEach((group, value) => {
        group.scale.set(engine.scaleX, engine.scaleY, engine.scaleY)
        const y = -(MAX - value) * engine.spacing
        engine.baseY.set(value, y)
        group.position.y = y
      })

      const heightPx = engine.spacing * engine.pxPerUnit
      setItemHeight(heightPx)
      setDigitHalf((engine.digitHeight * scale * engine.pxPerUnit) / 2)

      const value = modeRef.current === 'timer' ? selectedRef.current : activeRef.current
      const top = (MAX - value) * heightPx
      list.scrollTop = top
      engine.rail.position.y = top / engine.pxPerUnit
    }

    const onScroll = () => {
      const engine = engineRef.current
      if (!engine) return
      engine.rail.position.y = list.scrollTop / engine.pxPerUnit
      if (modeRef.current === 'timer') return

      const index = Math.round(list.scrollTop / (engine.spacing * engine.pxPerUnit))
      const value = MAX - Math.min(MAX - MIN, Math.max(0, index))
      if (activeRef.current !== value) {
        activeRef.current = value
        setActive(value)
      }
    }

    const cancelIntro = () => {
      if (!introFrame) return
      window.cancelAnimationFrame(introFrame)
      introFrame = 0
      introDone = true
      list.style.scrollSnapType = ''
      onScroll()
    }

    const animate = () => {
      if (disposed) return
      frame = window.requestAnimationFrame(animate)
      const engine = engineRef.current
      if (!engine) return

      const target = targetRef.current
      progressRef.current += (target - progressRef.current) * 0.14
      if (Math.abs(target - progressRef.current) < 0.001) progressRef.current = target
      const progress = progressRef.current

      currentColor.copy(wheelColor).lerp(timerColor, progress)
      engine.shadow.color.copy(wheelShadow).lerp(timerShadow, progress)
      engine.shadow.opacity = 0.12 + progress * 0.06

      engine.groups.forEach((group, value) => {
        const material = engine.materials.get(value)!
        const selected = value === selectedRef.current ? progress : 0
        const gone = value === selectedRef.current ? 0 : progress

        group.position.y = (engine.baseY.get(value) ?? 0) - 0.3 * selected
        group.position.z = -7 * gone
        material.opacity = 1 - gone
        material.color.copy(currentColor)
        material.emissive.copy(baseGlow).lerp(accentGlow, selected * progress * 0.18)
      })

      document.documentElement.style.setProperty('--press', `${(0.3 * progress * engine.pxPerUnit).toFixed(1)}px`)
      engine.renderer.render(engine.scene, engine.camera)
    }

    fetch('/fonts/helvetiker_bold.typeface.json')
      .then((response) => response.json())
      .then((data) => {
        if (disposed) return

        const font = new FontLoader().parse(data)
        const geometries: THREE.BufferGeometry[] = []
        const widths: number[] = []

        for (let digit = 0; digit <= 9; digit += 1) {
          const geometry = new TextGeometry(String(digit), {
            font,
            size: 1,
            depth: 0.22,
            curveSegments: 8,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.012,
            bevelSegments: 2,
          })
          geometry.computeBoundingBox()
          const box = geometry.boundingBox!
          const width = box.max.x - box.min.x
          const height = box.max.y - box.min.y
          geometry.translate(-(box.min.x + box.max.x) / 2, -(box.min.y + box.max.y) / 2, -0.11)
          geometry.userData = { width, height }
          widths[digit] = width
          geometries.push(geometry)
        }

        const groups = new Map<number, THREE.Group>()
        const materials = new Map<number, THREE.MeshStandardMaterial>()
        const baseY = new Map<number, number>()
        const gap = 0.015

        ALL_VALUES.forEach((value) => {
          const digits = String(value).split('').map(Number)
          const totalWidth = digits.reduce((sum, digit) => sum + widths[digit], 0) + gap * (digits.length - 1)
          const group = new THREE.Group()
          group.userData = { width: totalWidth }
          const material = new THREE.MeshStandardMaterial({
            color: wheelColor,
            metalness: 0.25,
            roughness: 0.3,
            transparent: true,
            opacity: 1,
          })

          let cursor = -totalWidth / 2
          digits.forEach((digit) => {
            const mesh = new THREE.Mesh(geometries[digit], material)
            mesh.castShadow = true
            mesh.position.x = cursor + widths[digit] / 2
            cursor += widths[digit] + gap
            group.add(mesh)
          })

          rail.add(group)
          groups.set(value, group)
          materials.set(value, material)
          baseY.set(value, 0)
        })

        engineRef.current = {
          renderer,
          scene,
          camera,
          rail,
          groups,
          materials,
          baseY,
          geometries,
          digitHeight: geometries[0].userData.height as number,
          shadow,
          pxPerUnit: 1,
          spacing: 1,
          scaleX: 1,
          scaleY: 1,
        }

        layout()

        if (!introDone) {
          introDone = true
          const engine = engineRef.current
          const from = (MAX - MIN) * engine.spacing * engine.pxPerUnit
          const to = (MAX - INTRO_END) * engine.spacing * engine.pxPerUnit
          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

          list.style.scrollSnapType = 'none'
          list.scrollTop = from
          activeRef.current = MIN
          setActive(MIN)

          if (reduced) {
            list.scrollTop = to
            list.style.scrollSnapType = ''
            activeRef.current = INTRO_END
            setActive(INTRO_END)
          } else {
            let startedAt = 0
            const tick = (now: number) => {
              if (!startedAt) startedAt = now
              const progress = Math.min(1, (now - startedAt) / 1200)
              const eased = 1 - Math.pow(1 - progress, 3)
              list.scrollTop = from + (to - from) * eased
              if (progress < 1) {
                introFrame = window.requestAnimationFrame(tick)
              } else {
                introFrame = 0
                list.style.scrollSnapType = ''
                activeRef.current = INTRO_END
                setActive(INTRO_END)
              }
            }
            introFrame = window.requestAnimationFrame(tick)
          }
        }

        animate()
      })
      .catch((error) => console.error('Unable to load digit geometry font', error))

    list.addEventListener('scroll', onScroll, { passive: true })
    list.addEventListener('wheel', cancelIntro, { passive: true })
    list.addEventListener('touchstart', cancelIntro, { passive: true })
    window.addEventListener('resize', layout)

    return () => {
      disposed = true
      if (frame) window.cancelAnimationFrame(frame)
      if (introFrame) window.cancelAnimationFrame(introFrame)
      list.removeEventListener('scroll', onScroll)
      list.removeEventListener('wheel', cancelIntro)
      list.removeEventListener('touchstart', cancelIntro)
      window.removeEventListener('resize', layout)
      const engine = engineRef.current
      if (engine) {
        engine.geometries.forEach((geometry) => geometry.dispose())
        engine.materials.forEach((material) => material.dispose())
        engine.shadow.dispose()
      }
      backdrop.geometry.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    if (mode !== 'timer') return
    if (remaining === 0) return

    const timer = window.setTimeout(() => {
      setRemaining((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [mode, remaining])

  const enterTimer = useCallback((value: number) => {
    if (modeRef.current === 'timer') return
    selectedRef.current = value
    activeRef.current = value
    setActive(value)
    modeRef.current = 'timer'
    targetRef.current = 1
    setMode('timer')
    setRemaining(value * 60)
  }, [])

  const exitTimer = useCallback(() => {
    if (modeRef.current !== 'timer') return
    modeRef.current = 'scroll'
    targetRef.current = 0
    setMode('scroll')
    const value = selectedRef.current === 0 ? MIN : selectedRef.current
    activeRef.current = value
    setActive(value)
    centerValue(value)
  }, [centerValue])

  useEffect(() => {
    if (mode !== 'timer') return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') exitTimer()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mode, exitTimer])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  return (
    <div
      className={`app${mode === 'timer' ? ' is-timer' : ''}`}
      style={{ '--digit-half': `${digitHalf}px` } as CSSProperties}
    >
      <div className="stage" ref={mountRef} />

      <div
        ref={listRef}
        className={`scroller${mode === 'timer' ? ' is-idle' : ''}`}
        style={{ '--item-height': `${itemHeight}px` } as CSSProperties}
        tabIndex={0}
        role="list"
        aria-label="Pick a number between 1 and 90"
      >
        {VALUES.map((value) => (
          <div className="scroller__item" key={value} role="listitem">
            <button
              type="button"
              className="scroller__hit"
              onClick={() => enterTimer(value)}
              tabIndex={value === active && mode === 'scroll' ? 0 : -1}
              aria-hidden={value !== active || mode === 'timer'}
              aria-label={`Start a ${value} minute countdown`}
            />
          </div>
        ))}
      </div>

      {mode === 'timer' && (
        <>
          <button
            type="button"
            className="timer-hit"
            onClick={exitTimer}
            aria-label="Return to the scroller"
          />
          <div className="timer-readout" aria-label={`${minutes} minutes and ${seconds} seconds remaining`}>
            {`${pad(minutes)}:${pad(seconds)}`}
          </div>
        </>
      )}
    </div>
  )
}
