import { deskLabel, type Perspective } from '../lib/theme'

type HeaderProps = {
  perspective: Perspective
  onChange: (next: Perspective) => void
}

export function Header({ perspective, onChange }: HeaderProps) {
  return (
    <header className="header" id="top">
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className="wrap header-inner">
        <a className="logo" href="#top">
          <span className="logo-mark">Double D</span>
          <span className="logo-sub">Dmitry × Davis</span>
        </a>
        <fieldset className="switch">
          <legend className="sr-only">Perspective</legend>
          {(['dmitry', 'davis'] as const).map((desk) => (
            <label key={desk}>
              <input
                type="radio"
                name="perspective"
                value={desk}
                checked={perspective === desk}
                onChange={() => onChange(desk)}
              />
              <span>{deskLabel(desk)}</span>
            </label>
          ))}
        </fieldset>
      </div>
    </header>
  )
}
