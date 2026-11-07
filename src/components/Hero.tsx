import { useEffect, useRef } from 'react'
import { useFinePointer } from '../hooks/useMedia'
import type { MarkState } from '../lib/mark'
import { LetterPair } from './LetterPair'

type HeroProps = {
  mark: MarkState
  reduced: boolean
}

export function Hero({ mark, reduced }: HeroProps) {
  const shiftRef = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()

  useEffect(() => {
    const node = shiftRef.current
    if (!node) return
    if (reduced || !fine) {
      node.style.transform = ''
      return
    }
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 22
      const y = (event.clientY / window.innerHeight - 0.5) * 14
      node.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, fine])

  return (
    <section className="hero" aria-labelledby="intro-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="kicker">01 — Intro</p>
          <h1 id="intro-title">
            <span className="line">One letter,</span>
            <span className="line line-shift">
              <em>two</em> hands.
            </span>
          </h1>
          <p className="dek">
            Double D is Dmitry × Davis. This page is their shared desk: one pair of Ds to tune, then
            four machines that refuse to sit still.
          </p>
          <div className="hero-actions">
            <a className="link cta" href="#playground">
              Tune the pair
            </a>
            <a className="link" href="#machines">
              Meet the machines
            </a>
          </div>
        </div>
        <div className="hero-mark">
          <div className="hero-mark-shift" ref={shiftRef}>
            <LetterPair mark={mark} reduced={reduced} />
          </div>
        </div>
      </div>
    </section>
  )
}
