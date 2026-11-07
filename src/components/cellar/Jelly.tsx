import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { boing, jellyRest, stepJelly, type Jelly } from '../../lib/cellar'
import { createStage, makeDGeometry, pointerPlane } from './kit'

type Api = {
  setTarget: (squash: number, shear: number) => void
  nudgeTarget: (dSquash: number, dShear: number) => void
  squash: () => void
  boing: () => void
  reset: () => void
}

export function Jelly({ reduced }: { reduced: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced
  const api = useRef<Api | null>(null)
  const [status, setStatus] = useState('Drag up or down to squash.')

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    const stage = createStage(canvas, host)
    if (!stage) return
    const mesh = new THREE.Mesh(makeDGeometry(), stage.fgMat)
    mesh.scale.setScalar(1.05)
    stage.scene.add(mesh)
    let jelly: Jelly = { ...jellyRest }
    const target = { squash: 0, shear: 0 }

    const apply = () => {
      const sx = 1.05 * (1 + jelly.squash * 0.55)
      const sy = 1.05 * (1 - jelly.squash * 0.72)
      const sz = 1.05 * (1 + jelly.squash * 0.28)
      mesh.scale.set(sx, Math.max(0.25, sy + Math.sin(jelly.v) * jelly.v * 0.01), sz)
      mesh.rotation.z = jelly.shear * 0.7
      mesh.rotation.x = 0.25 + jelly.shear * 0.15
      mesh.position.y = -jelly.squash * 0.35
    }

    stage.setUpdate((dt) => {
      jelly = stepJelly(jelly, target.squash, target.shear, dt, reducedRef.current)
      apply()
      return Math.abs(jelly.v) > 0.03 || Math.abs(jelly.sv) > 0.03 || Math.abs(jelly.squash - target.squash) > 0.02
    })
    api.current = {
      setTarget(squash, shear) {
        target.squash = squash
        target.shear = shear
        stage.requestDraw()
      },
      nudgeTarget(dSquash, dShear) {
        target.squash = Math.min(0.86, Math.max(0, target.squash + dSquash))
        target.shear = Math.min(0.55, Math.max(-0.55, target.shear + dShear))
        stage.requestDraw()
      },
      squash() {
        target.squash = 0.8
        target.shear = 0
        stage.requestDraw()
      },
      boing() {
        const next = boing(jelly, reducedRef.current)
        jelly = next.jelly
        target.squash = next.targetSquash
        target.shear = 0
        apply()
        stage.requestDraw()
      },
      reset() {
        jelly = { ...jellyRest }
        target.squash = 0
        target.shear = 0
        apply()
        stage.requestDraw()
      },
    }
    apply()
    stage.requestDraw()
    return () => stage.dispose()
  }, [])

  function onKey(event: React.KeyboardEvent<HTMLCanvasElement>) {
    const deltas: Record<string, { squash: number; shear: number }> = {
      ArrowUp: { squash: -0.16, shear: 0 },
      ArrowDown: { squash: 0.16, shear: 0 },
      ArrowLeft: { squash: 0, shear: -0.14 },
      ArrowRight: { squash: 0, shear: 0.14 },
    }
    const delta = deltas[event.key]
    if (!delta) return
    event.preventDefault()
    event.stopPropagation()
    api.current?.nudgeTarget(delta.squash, delta.shear)
  }

  return (
    <div className="cell" data-cell="jelly">
      <div
        className="cell-view"
        ref={hostRef}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          const point = pointerPlane(event, event.currentTarget)
          api.current?.setTarget(Math.max(0, -point.y) * 0.7, point.x * 0.35)
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
          const point = pointerPlane(event, event.currentTarget)
          api.current?.setTarget(Math.max(0, -point.y) * 0.7, point.x * 0.35)
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
          setStatus('Let go. It tries to remember its shape.')
          api.current?.setTarget(0, 0)
        }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Jelly D. Drag up or down to squash it. Arrow keys squash and shear."
          onKeyDown={onKey}
        />
      </div>
      <div className="cell-bar">
        <span className="cell-name">Jelly D</span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            api.current?.squash()
            setStatus('Squashed flat.')
          }}
        >
          Squash
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            api.current?.boing()
            setStatus(reduced ? 'Held in a squash.' : 'Boing.')
          }}
        >
          Boing
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            api.current?.reset()
            setStatus('Jelly reset.')
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
