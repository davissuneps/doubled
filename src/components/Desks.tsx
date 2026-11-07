import { deskLabel, type Perspective } from '../lib/theme'

type DesksProps = {
  perspective: Perspective
  onChange: (next: Perspective) => void
}

const copy: Record<Perspective, string> = {
  dmitry:
    'Pressure, weight, and the mark that sits on the page. This desk is dark and warm. Its starting cut keeps one D heavy and the other a thin counter-voice, pulled close.',
  davis:
    'Interval, air, and the space inside the form. This desk is paper-bright. Its starting cut opens the gap so a lighter D can answer a darker one.',
}

export function Desks({ perspective, onChange }: DesksProps) {
  return (
    <section className="section ruled" id="desks" aria-labelledby="desks-title">
      <div className="wrap">
        <p className="kicker">02 — Desks</p>
        <h2 id="desks-title">Two perspectives, on purpose.</h2>
        <p className="lead">
          Each perspective is a desk with its own palette and its own tune. Edits stay on the desk
          where you made them. Reset restores that desk’s starting cut.
        </p>
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
                <span className="desk-kicker">{active ? 'Active desk' : 'Switch desk'}</span>
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
