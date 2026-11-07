import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Desks } from './components/Desks'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Note } from './components/Note'

const Cellar = lazy(() => import('./components/Cellar').then((mod) => ({ default: mod.Cellar })))
import { Playground } from './components/Playground'
import { usePrefersReducedMotion } from './hooks/useMedia'
import { deskHotkeyBlocked, hotkeyAction } from './lib/hotkeys'
import { describeMark, preset, shuffle, swap, type MarkState } from './lib/mark'
import {
  deskLabel,
  readStoredPerspective,
  storePerspective,
  type Perspective,
} from './lib/theme'

const THEME_COLOR: Record<Perspective, string> = {
  dmitry: '#12110F',
  davis: '#F4EFE6',
}

export function App() {
  const [perspective, setPerspective] = useState<Perspective>(() => readStoredPerspective())
  const [benches, setBenches] = useState<Record<Perspective, MarkState>>(() => ({
    dmitry: preset('dmitry'),
    davis: preset('davis'),
  }))
  const [status, setStatus] = useState('')
  const reduced = usePrefersReducedMotion()
  const perspectiveRef = useRef(perspective)
  const benchesRef = useRef(benches)
  perspectiveRef.current = perspective
  benchesRef.current = benches

  useEffect(() => {
    document.documentElement.dataset.theme = perspective
    storePerspective(perspective)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[perspective])
  }, [perspective])

  function selectDesk(next: Perspective) {
    setPerspective(next)
    setStatus(`Showing the ${deskLabel(next)} desk.`)
  }

  function writeDesk(next: MarkState, message?: string) {
    const desk = perspectiveRef.current
    const updated = { ...benchesRef.current, [desk]: next }
    benchesRef.current = updated
    setBenches(updated)
    if (message) setStatus(message)
  }

  function shuffleDesk() {
    const next = shuffle(benchesRef.current[perspectiveRef.current])
    writeDesk(next, `Shuffled. ${describeMark(next)}`)
  }

  function swapDesk() {
    writeDesk(swap(benchesRef.current[perspectiveRef.current]), 'Swapped the two Ds.')
  }

  function resetDesk() {
    const desk = perspectiveRef.current
    writeDesk(preset(desk), `Reset to the ${deskLabel(desk)} starting cut.`)
  }

  const actions = useRef({ selectDesk, shuffleDesk, swapDesk, resetDesk })
  actions.current = { selectDesk, shuffleDesk, swapDesk, resetDesk }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const inCellar = event.target instanceof HTMLElement && Boolean(event.target.closest('#cellar'))
      if (event.repeat || deskHotkeyBlocked(event.target, inCellar)) return
      const action = hotkeyAction(event)
      if (!action) return
      event.preventDefault()
      if (action === 'dmitry' || action === 'davis') actions.current.selectDesk(action)
      else if (action === 'shuffle') actions.current.shuffleDesk()
      else if (action === 'swap') actions.current.swapDesk()
      else actions.current.resetDesk()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <Header perspective={perspective} onChange={selectDesk} />
      <main id="content">
        <Hero mark={benches[perspective]} reduced={reduced} />
        <Desks perspective={perspective} onChange={selectDesk} />
        <Playground
          perspective={perspective}
          mark={benches[perspective]}
          reduced={reduced}
          status={status}
          onChange={(update) => writeDesk(update(benchesRef.current[perspectiveRef.current]))}
          onShuffle={shuffleDesk}
          onSwap={swapDesk}
          onReset={resetDesk}
        />
        <Note />
        <Suspense
          fallback={
            <section className="section ruled" id="cellar" aria-busy="true">
              <div className="wrap">
                <p className="kicker">05 — Cellar</p>
                <h2>Under the desk.</h2>
                <p className="lead">The four machines are loading.</p>
              </div>
            </section>
          }
        >
          <Cellar reduced={reduced} />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
