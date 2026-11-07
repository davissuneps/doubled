import * as THREE from 'three'

export type Stage = {
  scene: THREE.Scene
  fgMat: THREE.MeshStandardMaterial
  accentMat: THREE.MeshStandardMaterial
  requestDraw: () => void
  setUpdate: (fn: (dt: number) => boolean) => void
  dispose: () => void
}

export function makeDGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  const spine = -0.42
  shape.moveTo(spine, -1)
  shape.lineTo(spine, 1)
  shape.absarc(spine + 0.22, 0, 1, Math.PI / 2, -Math.PI / 2, true)
  shape.closePath()
  const hole = new THREE.Path()
  hole.moveTo(spine + 0.28, -0.48)
  hole.absarc(spine + 0.28, 0, 0.48, -Math.PI / 2, Math.PI / 2, false)
  hole.lineTo(spine + 0.28, 0.48)
  shape.holes.push(hole)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.46,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.06,
    bevelSegments: 1,
    curveSegments: 14,
  })
  geo.computeBoundingBox()
  const box = geo.boundingBox
  if (box) {
    const center = new THREE.Vector3()
    box.getCenter(center)
    geo.translate(-center.x, -center.y, -center.z)
  }
  return geo
}

export function pointerPlane(event: { clientX: number; clientY: number }, el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1
  const y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1)
  return { x: x * 1.35, y: y * 1.15 }
}

function paintGrid(grid: THREE.GridHelper, color: string) {
  const materials = Array.isArray(grid.material) ? grid.material : [grid.material]
  for (const material of materials) {
    if (material instanceof THREE.LineBasicMaterial) material.color.set(color)
  }
}

export function createStage(canvas: HTMLCanvasElement, host: HTMLElement): Stage | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'low-power',
    })
  } catch {
    host.dataset.webgl = 'missing'
    return null
  }
  if (!renderer.getContext()) {
    host.dataset.webgl = 'missing'
    renderer.dispose()
    return null
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40)
  camera.position.set(0.85, 1.45, 6.6)
  camera.lookAt(0, -0.12, 0)

  const fgMat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.05 })
  const accentMat = new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.08 })
  const floorMat = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 })
  const hemi = new THREE.HemisphereLight('#ffffff', '#000000', 0.55)
  const key = new THREE.DirectionalLight('#ffffff', 2.6)
  key.position.set(4.2, 6.2, 5)
  const rim = new THREE.DirectionalLight('#ffffff', 1.35)
  rim.position.set(-4.5, 1.4, -2.4)
  scene.add(hemi, key, rim)

  const floor = new THREE.Mesh(new THREE.CircleGeometry(2.15, 36), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.28
  scene.add(floor)

  const grid = new THREE.GridHelper(3.5, 8)
  grid.position.y = -1.27
  scene.add(grid)

  function applyTheme() {
    const style = getComputedStyle(document.documentElement)
    const bg = style.getPropertyValue('--bg').trim() || '#f4efe6'
    const fg = style.getPropertyValue('--fg').trim() || '#16140f'
    const accent = style.getPropertyValue('--accent').trim() || '#1e3ad6'
    const line = style.getPropertyValue('--line').trim() || '#7a7164'
    const surface = style.getPropertyValue('--surface').trim() || '#e7e0d4'
    scene.background = new THREE.Color(bg)
    renderer.setClearColor(bg)
    fgMat.color.set(fg)
    accentMat.color.set(accent)
    floorMat.color.set(surface)
    rim.color.set(accent)
    paintGrid(grid, line)
  }
  applyTheme()

  const themeWatcher = new MutationObserver(() => {
    applyTheme()
    requestDraw()
  })
  themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  let update: (dt: number) => boolean = () => false
  let visible = true
  let queued = false
  let last = performance.now()
  let alive = true

  function resize() {
    const width = host.clientWidth
    const height = host.clientHeight
    if (width < 2 || height < 2) return
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
    if (renderer.getPixelRatio() !== ratio) renderer.setPixelRatio(ratio)
    renderer.setSize(width, height, false)
    camera.aspect = width / Math.max(height, 1)
    camera.updateProjectionMatrix()
  }

  function frame(now: number) {
    queued = false
    if (!alive) return
    const dt = Math.min(0.033, (now - last) / 1000)
    last = now
    resize()
    const again = update(dt)
    renderer.render(scene, camera)
    if (again && visible) requestDraw()
  }

  function requestDraw() {
    if (!alive || queued || !visible) return
    queued = true
    requestAnimationFrame(frame)
  }

  const resizeWatcher = new ResizeObserver(() => requestDraw())
  resizeWatcher.observe(host)
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) requestDraw()
  })
  visibility.observe(host)

  return {
    scene,
    fgMat,
    accentMat,
    requestDraw,
    setUpdate(fn) {
      update = fn
    },
    dispose() {
      alive = false
      themeWatcher.disconnect()
      resizeWatcher.disconnect()
      visibility.disconnect()
      scene.traverse((obj) => {
        const withGeo = obj as THREE.Mesh
        if (withGeo.geometry) withGeo.geometry.dispose()
      })
      fgMat.dispose()
      accentMat.dispose()
      floorMat.dispose()
      renderer.dispose()
    },
  }
}
