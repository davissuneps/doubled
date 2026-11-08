import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { aimGate, gatePose, gateRest, quarterTurn, requestSend, stepGate, type Gate } from '../../lib/cellar'
import { createStage, makeDGeometry } from './kit'

type Api = {
  aim: (dyaw: number, dpitch: number) => void
  turn: () => void
  send: () => string
  reset: () => void
}

export function Portal({ reduced }: { reduced: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced
  const api = useRef<Api | null>(null)
  const onArrived = useRef<(() => void) | null>(null)
  const [status, setStatus] = useState('Drag to aim the rings.')
  onArrived.current = () => setStatus('It came out upside down.')

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    const stage = createStage(canvas, host)
    if (!stage) return
    const rig = new THREE.Group()
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.07, 12, 40), stage.accentMat)
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.055, 12, 40), stage.fgMat)
    ringB.rotation.set(1.05, 0.35, 0.8)
    const letter = new THREE.Mesh(makeDGeometry(), stage.fgMat)
    letter.scale.setScalar(0.38)
    rig.add(ringA, ringB, letter)
    stage.scene.add(rig)
    let gate: Gate = gateRest()

    const apply = () => {
      rig.rotation.y = gate.yaw
      rig.rotation.x = gate.pitch
      const pose = gatePose(gate.phase)
      letter.position.set(pose.x, pose.y, pose.z)
      letter.rotation.set(0.2, gate.phase * 0.6, pose.rotZ)
      letter.scale.set(0.38 * pose.scaleX, 0.38, 0.38)
    }

    stage.setUpdate((dt) => {
      const wasSending = gate.sending
      gate = stepGate(gate, dt)
      apply()
      if (wasSending && !gate.sending) onArrived.current?.()
      return gate.sending
    })
    api.current = {
      aim(dyaw, dpitch) {
        gate = aimGate(gate, dyaw, dpitch)
        apply()
        stage.requestDraw()
      },
      turn() {
        gate = quarterTurn(gate)
        apply()
        stage.requestDraw()
      },
      send() {
        const next = requestSend(gate, reducedRef.current)
        gate = next.gate
        apply()
        stage.requestDraw()
        return next.message
      },
      reset() {
        gate = gateRest()
        apply()
        stage.requestDraw()
      },
    }
    apply()
    stage.requestDraw()
    return () => stage.dispose()
  }, [])

  function onKey(event: React.KeyboardEvent<HTMLCanvasElement>) {
    const aim: Record<string, { yaw: number; pitch: number }> = {
      ArrowLeft: { yaw: -0.28, pitch: 0 },
      ArrowRight: { yaw: 0.28, pitch: 0 },
      ArrowUp: { yaw: 0, pitch: 0.18 },
      ArrowDown: { yaw: 0, pitch: -0.18 },
    }
    const delta = aim[event.key]
    if (delta) {
      event.preventDefault()
      event.stopPropagation()
      api.current?.aim(delta.yaw, delta.pitch)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      setStatus(api.current?.send() ?? status)
    }
  }

  return (
    <div className="cell" data-cell="portal">
      <div
        className="cell-view"
        ref={hostRef}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          hostRef.current?.setAttribute('data-x', String(event.clientX))
          hostRef.current?.setAttribute('data-y', String(event.clientY))
        }}
        onPointerMove={(event) => {
          const host = hostRef.current
          if (!host || !event.currentTarget.hasPointerCapture(event.pointerId)) return
          const lastX = Number(host.getAttribute('data-x') ?? event.clientX)
          const lastY = Number(host.getAttribute('data-y') ?? event.clientY)
          host.setAttribute('data-x', String(event.clientX))
          host.setAttribute('data-y', String(event.clientY))
          api.current?.aim((event.clientX - lastX) * 0.01, (event.clientY - lastY) * 0.008)
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
          setStatus('Rings aimed.')
        }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Wrong door. Drag to aim the rings. Enter sends a D through. Arrow keys turn the rig."
          onKeyDown={onKey}
        />
      </div>
      <div className="cell-bar">
        <span className="cell-name">Wrong door</span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setStatus(api.current?.send() ?? status)}
        >
          Send through
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            api.current?.turn()
            setStatus('Quarter turn.')
          }}
        >
          Quarter turn
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            api.current?.reset()
            setStatus('Portal reset.')
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
