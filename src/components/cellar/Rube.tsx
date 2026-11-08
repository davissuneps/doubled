import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { pokeRube, rubeRest, stepRube, type Rube } from '../../lib/cellar'
import { createStage, makeDGeometry } from './kit'

type Api = { poke: () => string; reset: () => void }

export function RubeMachine({ reduced }: { reduced: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced
  const api = useRef<Api | null>(null)
  const [status, setStatus] = useState('Press poke. One chain reaction.')

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    const stage = createStage(canvas, host)
    if (!stage) return

    const base = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.1, 1.35), stage.fgMat)
    base.position.y = -1.2
    stage.scene.add(base)

    const hammer = new THREE.Group()
    hammer.position.set(-1.45, -0.55, 0)
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.05, 0.12), stage.accentMat)
    arm.position.y = 0.52
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.34), stage.accentMat)
    head.position.y = 1.08
    hammer.add(arm, head)
    stage.scene.add(hammer)

    const dominoGeo = new THREE.BoxGeometry(0.16, 1.12, 0.52)
    const dominos = [-0.45, 0.2, 0.85].map((x) => {
      const group = new THREE.Group()
      group.position.set(x, -1.15, 0)
      const slab = new THREE.Mesh(dominoGeo, stage.fgMat)
      slab.position.y = 0.56
      const mark = new THREE.Mesh(makeDGeometry(), stage.accentMat)
      mark.scale.setScalar(0.16)
      mark.position.set(0, 0.7, 0.28)
      group.add(slab, mark)
      stage.scene.add(group)
      return group
    })

    const flyer = new THREE.Mesh(makeDGeometry(), stage.accentMat)
    flyer.scale.setScalar(0.28)
    flyer.position.set(1.45, -0.85, 0)
    stage.scene.add(flyer)

    let rube: Rube = rubeRest()
    const apply = () => {
      hammer.rotation.z = 0.95 - rube.hammer * 1.7
      dominos.forEach((group, index) => {
        group.rotation.z = -rube.dominos[index] * 1.25
      })
      flyer.position.y = -0.85 + rube.flyerY
      flyer.rotation.z = rube.flyerY * 1.4
      flyer.rotation.y = rube.flyerY
    }

    stage.setUpdate((dt) => {
      rube = stepRube(rube, dt)
      apply()
      return rube.running
    })
    api.current = {
      poke() {
        const next = pokeRube(rube, reducedRef.current)
        rube = next.rube
        apply()
        stage.requestDraw()
        return next.message
      },
      reset() {
        rube = rubeRest()
        apply()
        stage.requestDraw()
      },
    }
    apply()
    stage.requestDraw()
    return () => stage.dispose()
  }, [])

  function poke() {
    setStatus(api.current?.poke() ?? status)
  }

  return (
    <div className="cell" data-cell="rube">
      <div
        className="cell-view"
        ref={hostRef}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          poke()
        }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="One poke. Enter or click starts the hammer. The dominos fall in a chain."
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            event.stopPropagation()
            poke()
          }}
        />
      </div>
      <div className="cell-bar">
        <span className="cell-name">One poke</span>
        <button type="button" className="btn btn-primary" onClick={poke}>
          Poke
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            api.current?.reset()
            setStatus('Machine reset.')
          }}
        >
          Reset
        </button>
      </div>
      <p className="status cell-status" role="status">
        {status}
      </p>
    </div>
  )
}
