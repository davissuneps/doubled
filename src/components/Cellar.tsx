import { Jelly } from './cellar/Jelly'
import { Portal } from './cellar/Portal'
import { RubeMachine } from './cellar/Rube'
import { Updraft } from './cellar/Updraft'

export function Cellar({ reduced }: { reduced: boolean }) {
  return (
    <section className="section ruled" id="machines" aria-labelledby="machines-title">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">04 — Machines</p>
          <h2 id="machines-title">Four more Ds.</h2>
          <p className="lead">
            Same desk, same palette. Drag inside a pane or use the buttons under it. Focus a pane for
            arrow keys; Enter sends or pokes. Reset restores that machine alone.
          </p>
        </div>
        <div className="machine-grid panel">
          <Updraft reduced={reduced} />
          <Jelly reduced={reduced} />
          <Portal reduced={reduced} />
          <RubeMachine reduced={reduced} />
        </div>
      </div>
    </section>
  )
}
