import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { glyphPaint, motionActive, variation, type MarkState, type Vec } from '../lib/mark'

const CX = 600
const CY = 500

type LetterPairProps = {
  mark: MarkState
  reduced: boolean
  interactive?: boolean
  onOffset?: (which: 'a' | 'b', next: Vec) => void
}

type OffsetRef = RefObject<((which: 'a' | 'b', next: Vec) => void) | undefined>

export function LetterPair({ mark, reduced, interactive = false, onOffset }: LetterPairProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const onOffsetRef = useRef(onOffset)
  onOffsetRef.current = onOffset
  const { settings } = mark
  const fontSize = 520 * settings.scale
  const order: Array<'a' | 'b'> = settings.weightA >= settings.weightB ? ['b', 'a'] : ['a', 'b']

  return (
    <svg
      ref={svgRef}
      className="letter-svg"
      viewBox="0 0 1200 900"
      aria-hidden="true"
    >
      <line
        x1={CX}
        y1="78"
        x2={CX}
        y2="822"
        stroke="var(--line)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      {order.map((which) => (
        <Glyph
          key={which}
          which={which}
          mark={mark}
          fontSize={fontSize}
          interactive={interactive}
          reduced={reduced}
          svgRef={svgRef}
          onOffsetRef={onOffsetRef}
        />
      ))}
    </svg>
  )
}

function Glyph({
  which,
  mark,
  fontSize,
  interactive,
  reduced,
  svgRef,
  onOffsetRef,
}: {
  which: 'a' | 'b'
  mark: MarkState
  fontSize: number
  interactive: boolean
  reduced: boolean
  svgRef: RefObject<SVGSVGElement | null>
  onOffsetRef: OffsetRef
}) {
  const driftRef = useRef<SVGGElement>(null)
  const [dragging, setDragging] = useState(false)
  const settings = mark.settings
  const offset = which === 'a' ? mark.offsetA : mark.offsetB
  const x = CX + (which === 'a' ? -settings.gap / 2 : settings.gap / 2) + offset.x
  const y = CY + offset.y
  const rotation = which === 'a' ? settings.rotation : -settings.rotation
  const weight = which === 'a' ? settings.weightA : settings.weightB
  const soft = which === 'a' ? settings.softA : settings.softB
  const opsz = which === 'a' ? settings.opszA : settings.opszB
  const wonk = which === 'a' ? settings.wonkA : settings.wonkB
  const italic = which === 'a' ? settings.italicA : settings.italicB
  const paint = glyphPaint(which, settings)
  const colors = { fg: 'var(--fg)', accent: 'var(--accent)', none: 'none' }

  useDrift(driftRef, which === 'a' ? 0 : Math.PI, settings.drift, reduced || dragging)

  function onPointerDown(event: ReactPointerEvent<SVGGElement>) {
    if (!interactive || event.button !== 0) return
    event.preventDefault()
    const svg = svgRef.current
    if (!svg) return
    const origin = which === 'a' ? mark.offsetA : mark.offsetB
    const startX = event.clientX
    const startY = event.clientY
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    setDragging(true)

    const move = (ev: PointerEvent) => {
      const matrix = svg.getScreenCTM()
      if (!matrix || matrix.a === 0 || matrix.d === 0) return
      onOffsetRef.current?.(which, {
        x: origin.x + (ev.clientX - startX) / matrix.a,
        y: origin.y + (ev.clientY - startY) / matrix.d,
      })
    }
    const end = () => {
      setDragging(false)
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', end)
      target.removeEventListener('pointercancel', end)
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', end)
    target.addEventListener('pointercancel', end)
  }

  return (
    <g
      className={interactive ? 'glyph' : 'glyph glyph-static'}
      transform={`translate(${x} ${y}) rotate(${rotation})`}
      style={{ mixBlendMode: settings.blend ? 'difference' : 'normal' }}
      onPointerDown={interactive ? onPointerDown : undefined}
    >
      <g ref={driftRef}>
        <rect
          x={-fontSize * 0.42}
          y={-fontSize * 0.55}
          width={fontSize * 0.84}
          height={fontSize * 1.05}
          fill="transparent"
        />
        <text
          className="d-letter"
          textAnchor="middle"
          dominantBaseline="central"
          fill={paint.fill === 'fg' ? colors.fg : 'transparent'}
          stroke={colors[paint.stroke]}
          strokeWidth={paint.strokeWidth}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{
            fontSize,
            fontStyle: italic ? 'italic' : 'normal',
            fontVariationSettings: variation(weight, soft, opsz, wonk),
          }}
        >
          D
        </text>
      </g>
    </g>
  )
}

function useDrift(
  ref: RefObject<SVGGElement | null>,
  phase: number,
  drift: number,
  paused: boolean,
) {
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (!motionActive(drift, paused)) {
      node.setAttribute('transform', 'translate(0 0)')
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = (now - start) / 1000
      const amp = 36 * drift
      const dx = Math.sin(t * 0.85 + phase) * amp
      const dy = Math.cos(t * 0.6 + phase) * amp * 0.45
      node.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      node.setAttribute('transform', 'translate(0 0)')
    }
  }, [ref, phase, drift, paused])
}
