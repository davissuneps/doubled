import { Jelly } from './cellar/Jelly'
import { Portal } from './cellar/Portal'
import { RubeMachine } from './cellar/Rube'
import { Updraft } from './cellar/Updraft'

export function Cellar({ reduced }: { reduced: boolean }) {
  return (
    <section className="section ruled" id="cellar" aria-labelledby="cellar-title">
      <div className="wrap">
        <p className="kicker">05 — Cellar</p>
        <h2 id="cellar-title">Under the desk.</h2>
        <p className="lead">
          Four machines share one square, and none of them are sensible. Drag inside a pane, or use
          the buttons under it. Arrow keys work once a pane is focused. Reset puts that machine back.
        </p>
        <div className="cellar-square">
          <Updraft reduced={reduced} />
          <Jelly reduced={reduced} />
          <Portal reduced={reduced} />
          <RubeMachine reduced={reduced} />
        </div>
      </div>
    </section>
  )
}
