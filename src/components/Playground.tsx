import { deskLabel, type Perspective } from '../lib/theme'
import {
  inkLabel,
  limits,
  patchSettings,
  readout,
  setOffset,
  type Ink,
  type MarkState,
} from '../lib/mark'
import { LetterPair } from './LetterPair'
import { Slider } from './Slider'

type Update = (current: MarkState) => MarkState

type PlaygroundProps = {
  perspective: Perspective
  mark: MarkState
  reduced: boolean
  status: string
  onChange: (update: Update) => void
  onShuffle: () => void
  onSwap: () => void
  onReset: () => void
}

const inks: Ink[] = ['solid', 'outline', 'a-solid', 'b-solid']

export function Playground({
  perspective,
  mark,
  reduced,
  status,
  onChange,
  onShuffle,
  onSwap,
  onReset,
}: PlaygroundProps) {
  const settings = mark.settings

  function specimenStyle(which: 'a' | 'b') {
    const weight = which === 'a' ? settings.weightA : settings.weightB
    const soft = which === 'a' ? settings.softA : settings.softB
    const opsz = which === 'a' ? settings.opszA : settings.opszB
    const wonk = which === 'a' ? settings.wonkA : settings.wonkB
    const italic = which === 'a' ? settings.italicA : settings.italicB
    return {
      fontVariationSettings: `"wght" ${weight}, "SOFT" ${soft}, "opsz" ${opsz}, "WONK" ${wonk ? 1 : 0}`,
      fontStyle: italic ? ('italic' as const) : ('normal' as const),
      fontWeight: weight,
    }
  }

  return (
    <section className="band" id="playground" aria-labelledby="play-title">
      <div className="wrap section">
        <div className="section-head">
          <p className="kicker">03 — Pair</p>
          <h2 id="play-title">A desk for two Ds.</h2>
          <p className="lead">
            Drag either letter, or set it with the sliders. Shuffle rolls a new pairing, Swap
            exchanges the cuts, Reset restores this desk’s starting cut.
          </p>
        </div>
        <div className="tool">
          <div className="tool-stage">
            <div className="stage-frame panel">
              <div className="stage-meta">
                <span>Live pair</span>
                <span>{deskLabel(perspective)}</span>
              </div>
              <LetterPair
                mark={mark}
                reduced={reduced}
                interactive
                onOffset={(which, next) => onChange((current) => setOffset(current, which, next))}
              />
            </div>
            <div className="specimen">
              <figure>
                <figcaption>Dmitry</figcaption>
                <p style={specimenStyle('a')}>Double D</p>
              </figure>
              <figure>
                <figcaption>Davis</figcaption>
                <p style={specimenStyle('b')}>Double D</p>
              </figure>
            </div>
            <p className="readout">{readout(mark)}</p>
          </div>
          <div className="tool-actions">
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={onShuffle}>
                Shuffle <kbd>S</kbd>
              </button>
              <button type="button" className="btn" onClick={onSwap}>
                Swap <kbd>W</kbd>
              </button>
              <button type="button" className="btn" onClick={onReset}>
                Reset <kbd>R</kbd>
              </button>
            </div>
            <p className="status" role="status">
              {status || 'Drag the letters or use the controls.'}
            </p>
            <p className="hint">
              Keys 1–2 switch desks. Shortcuts pause while a machine pane is focused.
            </p>
          </div>
          <div className="tool-controls">
            <fieldset>
              <legend>Cut</legend>
              <Slider
                id="weight-a"
                label="Dmitry weight"
                min={limits.weight[0]}
                max={limits.weight[1]}
                step={1}
                value={settings.weightA}
                display={String(settings.weightA)}
                onChange={(value) => onChange((current) => patchSettings(current, { weightA: value }))}
              />
              <Slider
                id="weight-b"
                label="Davis weight"
                min={limits.weight[0]}
                max={limits.weight[1]}
                step={1}
                value={settings.weightB}
                display={String(settings.weightB)}
                onChange={(value) => onChange((current) => patchSettings(current, { weightB: value }))}
              />
              <Slider
                id="soft-a"
                label="Dmitry softness"
                min={limits.soft[0]}
                max={limits.soft[1]}
                step={1}
                value={settings.softA}
                display={String(settings.softA)}
                onChange={(value) => onChange((current) => patchSettings(current, { softA: value }))}
              />
              <Slider
                id="soft-b"
                label="Davis softness"
                min={limits.soft[0]}
                max={limits.soft[1]}
                step={1}
                value={settings.softB}
                display={String(settings.softB)}
                onChange={(value) => onChange((current) => patchSettings(current, { softB: value }))}
              />
              <Slider
                id="opsz-a"
                label="Dmitry optical size"
                min={limits.opsz[0]}
                max={limits.opsz[1]}
                step={1}
                value={settings.opszA}
                display={String(settings.opszA)}
                onChange={(value) => onChange((current) => patchSettings(current, { opszA: value }))}
              />
              <Slider
                id="opsz-b"
                label="Davis optical size"
                min={limits.opsz[0]}
                max={limits.opsz[1]}
                step={1}
                value={settings.opszB}
                display={String(settings.opszB)}
                onChange={(value) => onChange((current) => patchSettings(current, { opszB: value }))}
              />
              <div className="checks">
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={settings.italicA}
                    onChange={(event) =>
                      onChange((current) => patchSettings(current, { italicA: event.target.checked }))
                    }
                  />
                  Dmitry italic
                </label>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={settings.italicB}
                    onChange={(event) =>
                      onChange((current) => patchSettings(current, { italicB: event.target.checked }))
                    }
                  />
                  Davis italic
                </label>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={settings.wonkA}
                    onChange={(event) =>
                      onChange((current) => patchSettings(current, { wonkA: event.target.checked }))
                    }
                  />
                  Dmitry wonk
                </label>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={settings.wonkB}
                    onChange={(event) =>
                      onChange((current) => patchSettings(current, { wonkB: event.target.checked }))
                    }
                  />
                  Davis wonk
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Arrangement</legend>
              <Slider
                id="gap"
                label="Gap"
                min={limits.gap[0]}
                max={limits.gap[1]}
                step={1}
                value={settings.gap}
                display={String(settings.gap)}
                onChange={(value) => onChange((current) => patchSettings(current, { gap: value }))}
              />
              <Slider
                id="rotation"
                label="Rotation"
                min={limits.rotation[0]}
                max={limits.rotation[1]}
                step={1}
                value={settings.rotation}
                display={`${settings.rotation}°`}
                onChange={(value) => onChange((current) => patchSettings(current, { rotation: value }))}
              />
              <Slider
                id="scale"
                label="Scale"
                min={limits.scale[0]}
                max={limits.scale[1]}
                step={0.01}
                value={settings.scale}
                display={`${Math.round(settings.scale * 100)}%`}
                onChange={(value) => onChange((current) => patchSettings(current, { scale: value }))}
              />
              <Slider
                id="stroke"
                label="Stroke"
                min={limits.stroke[0]}
                max={limits.stroke[1]}
                step={1}
                value={settings.stroke}
                display={`${settings.stroke}px`}
                onChange={(value) => onChange((current) => patchSettings(current, { stroke: value }))}
              />
            </fieldset>

            <fieldset>
              <legend>Ink</legend>
              {inks.map((ink) => (
                <label className="choice" key={ink}>
                  <input
                    type="radio"
                    name="ink"
                    value={ink}
                    checked={settings.ink === ink}
                    onChange={() => onChange((current) => patchSettings(current, { ink }))}
                  />
                  {inkLabel(ink)}
                </label>
              ))}
              <label className="choice">
                <input
                  type="checkbox"
                  checked={settings.mirror}
                  onChange={(event) =>
                    onChange((current) => patchSettings(current, { mirror: event.target.checked }))
                  }
                />
                Mirror across the spine
              </label>
              <label className="choice">
                <input
                  type="checkbox"
                  checked={settings.blend}
                  onChange={(event) =>
                    onChange((current) => patchSettings(current, { blend: event.target.checked }))
                  }
                />
                Difference blend
              </label>
              {settings.blend && (
                <p className="hint">
                  Difference blend is on. It can lower contrast — turn it off if a letter disappears.
                </p>
              )}
            </fieldset>

            <fieldset>
              <legend>Position</legend>
              <p className="hint">Drag on the sheet does the same thing as these sliders.</p>
              <Slider
                id="ax"
                label="Dmitry X"
                min={limits.offset[0]}
                max={limits.offset[1]}
                step={1}
                value={mark.offsetA.x}
                display={String(mark.offsetA.x)}
                onChange={(value) =>
                  onChange((current) => setOffset(current, 'a', { x: value, y: current.offsetA.y }))
                }
              />
              <Slider
                id="ay"
                label="Dmitry Y"
                min={limits.offset[0]}
                max={limits.offset[1]}
                step={1}
                value={mark.offsetA.y}
                display={String(mark.offsetA.y)}
                onChange={(value) =>
                  onChange((current) => setOffset(current, 'a', { x: current.offsetA.x, y: value }))
                }
              />
              <Slider
                id="bx"
                label="Davis X"
                min={limits.offset[0]}
                max={limits.offset[1]}
                step={1}
                value={mark.offsetB.x}
                display={String(mark.offsetB.x)}
                onChange={(value) =>
                  onChange((current) => setOffset(current, 'b', { x: value, y: current.offsetB.y }))
                }
              />
              <Slider
                id="by"
                label="Davis Y"
                min={limits.offset[0]}
                max={limits.offset[1]}
                step={1}
                value={mark.offsetB.y}
                display={String(mark.offsetB.y)}
                onChange={(value) =>
                  onChange((current) => setOffset(current, 'b', { x: current.offsetB.x, y: value }))
                }
              />
            </fieldset>

            <fieldset>
              <legend>Motion</legend>
              <Slider
                id="drift"
                label="Drift"
                min={limits.drift[0]}
                max={limits.drift[1]}
                step={0.01}
                value={settings.drift}
                display={`${Math.round(settings.drift * 100)}`}
                onChange={(value) => onChange((current) => patchSettings(current, { drift: value }))}
              />
              {reduced && (
                <p className="hint">
                  Drift stays editable, and playback is paused while reduced motion is on.
                </p>
              )}
            </fieldset>
          </div>
        </div>
      </div>
    </section>
  )
}
