import { deskLabel, type Perspective } from '../lib/theme'

type DesksProps = {
  perspective: Perspective
  onChange: (next: Perspective) => void
}

const copy: Record<Perspective, string> = {
  dmitry: 'Dark and warm. One D heavy, the other a thin counter-voice pulled close.',
  davis: 'Paper-bright. The gap opens so a lighter D can answer a darker one.',
}

export function Desks({ perspective, onChange }: DesksProps) {
  return (
    <section className="section ruled" id="desks" aria-labelledby="desks-title">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">02 — Desks</p>
          <h2 id="desks-title">Two desks, one page.</h2>
          <p className="lead">
            Each desk keeps its own palette and its own starting cut. Switch here or in the header —
            edits stay on the desk where you made them.
          </p>
        </div>
        <div className="desks">
          {(['dmitry', 'davis'] as const).map((desk) => {
            const active = perspective === desk
            return (
              <button
                key={desk}
                type="button"
                className="desk"
                aria-pressed={active}
                onClick={() => onChange(desk)}
              >
                <span className="desk-kicker">{active ? 'Active' : 'Switch'}</span>
                <span className="desk-name">{deskLabel(desk)}</span>
                <p className="desk-copy">{copy[desk]}</p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
