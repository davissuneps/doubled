import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { shoveSwarm, stepSwarm, swarmSeed, type Body } from '../../lib/cellar'
import { createStage, makeDGeometry, pointerPlane } from './kit'

type Api = {
  setFan: (fan: boolean) => void
  nudge: () => void
  reset: () => void
  setPointer: (point: { x: number; y: number } | null) => void
  shove: (dir: { x: number; y: number }) => void
}

export function Updraft({ reduced }: { reduced: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced
  const api = useRef<Api | null>(null)
  const [fan, setFan] = useState(false)
  const [status, setStatus] = useState('Drag pulls the letters in.')

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    const stage = createStage(canvas, host)
    if (!stage) return
    const geo = makeDGeometry()
    let bodies = swarmSeed()
    const fanRef = { current: false }
    const nudge = { current: false }
    const pointer = { current: null as { x: number; y: number } | null }
    const seen = { x: Number.NaN, y: Number.NaN }
    const meshes = bodies.map((body, index) => {
      const mesh = new THREE.Mesh(geo, index % 2 === 0 ? stage.fgMat : stage.accentMat)
      mesh.scale.setScalar(0.4)
      mesh.position.set(body.x, body.y, body.z)
      mesh.rotation.set(0.2, index * 0.45, index % 2 === 0 ? 0.15 : -0.2)
      stage.scene.add(mesh)
      return mesh
    })
    const cursor = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), stage.accentMat)
    cursor.visible = false
    stage.scene.add(cursor)

    const place = (next: Body[]) => {
      bodies = next
      next.forEach((body, index) => {
        meshes[index].position.set(body.x, body.y, body.z)
        meshes[index].rotation.z = body.vx * 0.35
        meshes[index].rotation.x = 0.2 + body.vy * 0.2
      })
    }

    stage.setUpdate((dt) => {
      const point = pointer.current
      const repeat = point !== null && point.x === seen.x && point.y === seen.y
      if (point) {
        seen.x = point.x
        seen.y = point.y
      } else {
        seen.x = Number.NaN
        seen.y = Number.NaN
      }
      const next = stepSwarm(bodies, {
        dt,
        pointer: reducedRef.current && repeat ? null : point,
        fan: fanRef.current,
        nudge: nudge.current,
        reduced: reducedRef.current,
      })
      nudge.current = false
      place(next)
      cursor.visible = pointer.current !== null
      if (pointer.current) cursor.position.set(pointer.current.x, pointer.current.y, 0.35)
      const energy = next.reduce((sum, body) => sum + Math.abs(body.vx) + Math.abs(body.vy), 0)
      return energy > 0.04 || pointer.current !== null
    })

    api.current = {
      setFan(next) {
        fanRef.current = next
      },
      nudge() {
        nudge.current = true
        stage.requestDraw()
      },
      reset() {
        fanRef.current = false
        pointer.current = null
        place(swarmSeed())
        stage.requestDraw()
      },
      setPointer(point) {
        pointer.current = point
        stage.requestDraw()
      },
      shove(dir) {
        place(shoveSwarm(bodies, dir, fanRef.current, reducedRef.current))
        stage.requestDraw()
      },
    }
    stage.requestDraw()
    return () => stage.dispose()
  }, [])

  function toggleFan() {
    const next = !fan
    setFan(next)
    api.current?.setFan(next)
    setStatus(next ? 'Drag blows the letters away.' : 'Drag pulls the letters in.')
  }

  function onKey(event: React.KeyboardEvent<HTMLCanvasElement>) {
    const move: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: 1 },
      ArrowDown: { x: 0, y: -1 },
    }
    const dir = move[event.key]
    if (!dir) return
    event.preventDefault()
    event.stopPropagation()
    api.current?.shove(dir)
  }

  return (
    <div className="cell" data-cell="updraft">
      <div
        className="cell-view"
        ref={hostRef}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          api.current?.setPointer(pointerPlane(event, event.currentTarget))
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
          api.current?.setPointer(pointerPlane(event, event.currentTarget))
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
          api.current?.setPointer(null)
          setStatus(fan ? 'Fanned away.' : 'Called in.')
        }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Updraft. Drag to pull the floating letters. Arrow keys shove them."
          onKeyDown={onKey}
        />
      </div>
      <div className="cell-bar">
        <span className="cell-name" id="updraft-title">
          Updraft
        </span>
        <button type="button" className="btn" aria-pressed={fan} onClick={toggleFan}>
          {fan ? 'Fanning' : 'Fan'}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            api.current?.nudge()
            setStatus('Nudged up.')
          }}
        >
          Nudge up
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setFan(false)
            api.current?.reset()
            setStatus('Updraft reset.')
          }}
        >
          Reset
        </button>
      </div>
      <p className="cell-status" role="status">
        {status}
      </p>
    </div>
  )
}
