import type { Perspective } from './theme'

export type Ink = 'solid' | 'outline' | 'a-solid' | 'b-solid'

export type MarkSettings = {
  weightA: number
  weightB: number
  softA: number
  softB: number
  opszA: number
  opszB: number
  wonkA: boolean
  wonkB: boolean
  italicA: boolean
  italicB: boolean
  gap: number
  rotation: number
  stroke: number
  scale: number
  drift: number
  ink: Ink
  mirror: boolean
  blend: boolean
}

export type Vec = { x: number; y: number }

export type MarkState = {
  settings: MarkSettings
  offsetA: Vec
  offsetB: Vec
}

export const limits = {
  weight: [120, 900] as const,
  soft: [0, 100] as const,
  opsz: [9, 144] as const,
  gap: [0, 340] as const,
  rotation: [-24, 24] as const,
  stroke: [0, 12] as const,
  scale: [0.72, 1.18] as const,
  drift: [0, 1] as const,
  offset: [-200, 200] as const,
}

const inks: Ink[] = ['solid', 'outline', 'a-solid', 'b-solid']

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function clampVec(vec: Vec): Vec {
  return {
    x: clamp(vec.x, limits.offset[0], limits.offset[1]),
    y: clamp(vec.y, limits.offset[0], limits.offset[1]),
  }
}

function between(value: number, min: number, max: number): boolean {
  return value >= min - 1e-6 && value <= max + 1e-6
}

function pick(rng: () => number, min: number, max: number, step: number): number {
  const raw = min + (max - min) * rng()
  const snapped = Math.round(raw / step) * step
  return clamp(Number(snapped.toFixed(4)), min, max)
}

export function preset(perspective: Perspective): MarkState {
  if (perspective === 'dmitry') {
    return {
      settings: {
        weightA: 860,
        weightB: 280,
        softA: 8,
        softB: 46,
        opszA: 144,
        opszB: 144,
        wonkA: false,
        wonkB: true,
        italicA: false,
        italicB: true,
        gap: 28,
        rotation: -5,
        stroke: 0,
        scale: 1.06,
        drift: 0.28,
        ink: 'a-solid',
        mirror: true,
        blend: false,
      },
      offsetA: { x: 0, y: 0 },
      offsetB: { x: 0, y: 0 },
    }
  }

  return {
    settings: {
      weightA: 220,
      weightB: 780,
      softA: 92,
      softB: 18,
      opszA: 28,
      opszB: 120,
      wonkA: true,
      wonkB: false,
      italicA: true,
      italicB: false,
      gap: 210,
      rotation: 7,
      stroke: 2,
      scale: 0.9,
      drift: 0.18,
      ink: 'b-solid',
      mirror: false,
      blend: false,
    },
    offsetA: { x: -16, y: 12 },
    offsetB: { x: 24, y: -18 },
  }
}

export function withMirror(state: MarkState): MarkState {
  if (!state.settings.mirror) return state
  return {
    ...state,
    offsetB: { x: -state.offsetA.x, y: state.offsetA.y },
  }
}

export function setMirror(state: MarkState, mirror: boolean): MarkState {
  return withMirror({ ...state, settings: { ...state.settings, mirror } })
}

export function setOffset(state: MarkState, which: 'a' | 'b', next: Vec): MarkState {
  const primary = clampVec(next)
  if (!state.settings.mirror) {
    return which === 'a' ? { ...state, offsetA: primary } : { ...state, offsetB: primary }
  }
  const other = { x: -primary.x, y: primary.y }
  return which === 'a'
    ? { ...state, offsetA: primary, offsetB: other }
    : { ...state, offsetB: primary, offsetA: other }
}

export function patchSettings(state: MarkState, patch: Partial<MarkSettings>): MarkState {
  const next: MarkState = { ...state, settings: { ...state.settings, ...patch } }
  if (patch.mirror !== undefined) return setMirror(next, patch.mirror)
  return next
}

export function swap(state: MarkState): MarkState {
  const settings = state.settings
  const ink: Ink =
    settings.ink === 'a-solid' ? 'b-solid' : settings.ink === 'b-solid' ? 'a-solid' : settings.ink
  return withMirror({
    settings: {
      ...settings,
      weightA: settings.weightB,
      weightB: settings.weightA,
      softA: settings.softB,
      softB: settings.softA,
      opszA: settings.opszB,
      opszB: settings.opszA,
      wonkA: settings.wonkB,
      wonkB: settings.wonkA,
      italicA: settings.italicB,
      italicB: settings.italicA,
      rotation: clamp(-settings.rotation, limits.rotation[0], limits.rotation[1]),
      ink,
    },
    offsetA: state.offsetB,
    offsetB: state.offsetA,
  })
}

export function shuffle(state: MarkState, rng: () => number = Math.random): MarkState {
  void state
  const ink = inks[Math.min(inks.length - 1, Math.floor(rng() * inks.length))] ?? 'solid'
  return withMirror({
    settings: {
      weightA: pick(rng, limits.weight[0], limits.weight[1], 10),
      weightB: pick(rng, limits.weight[0], limits.weight[1], 10),
      softA: pick(rng, limits.soft[0], limits.soft[1], 1),
      softB: pick(rng, limits.soft[0], limits.soft[1], 1),
      opszA: pick(rng, limits.opsz[0], limits.opsz[1], 1),
      opszB: pick(rng, limits.opsz[0], limits.opsz[1], 1),
      wonkA: rng() > 0.5,
      wonkB: rng() > 0.5,
      italicA: rng() > 0.5,
      italicB: rng() > 0.5,
      gap: pick(rng, limits.gap[0], limits.gap[1], 2),
      rotation: pick(rng, limits.rotation[0], limits.rotation[1], 1),
      stroke: pick(rng, limits.stroke[0], limits.stroke[1], 1),
      scale: pick(rng, limits.scale[0], limits.scale[1], 0.01),
      drift: pick(rng, limits.drift[0], limits.drift[1], 0.01),
      ink,
      mirror: rng() > 0.5,
      blend: false,
    },
    offsetA: clampVec({
      x: pick(rng, -140, 140, 2),
      y: pick(rng, -70, 70, 2),
    }),
    offsetB: clampVec({
      x: pick(rng, -140, 140, 2),
      y: pick(rng, -70, 70, 2),
    }),
  })
}

export function inBounds(state: MarkState): boolean {
  const settings = state.settings
  const checks: Array<[number, readonly [number, number]]> = [
    [settings.weightA, limits.weight],
    [settings.weightB, limits.weight],
    [settings.softA, limits.soft],
    [settings.softB, limits.soft],
    [settings.opszA, limits.opsz],
    [settings.opszB, limits.opsz],
    [settings.gap, limits.gap],
    [settings.rotation, limits.rotation],
    [settings.stroke, limits.stroke],
    [settings.scale, limits.scale],
    [settings.drift, limits.drift],
    [state.offsetA.x, limits.offset],
    [state.offsetA.y, limits.offset],
    [state.offsetB.x, limits.offset],
    [state.offsetB.y, limits.offset],
  ]
  return checks.every(([value, [min, max]]) => between(value, min, max)) && inks.includes(settings.ink)
}

export type GlyphPaint = {
  fill: 'fg' | 'none'
  stroke: 'fg' | 'accent' | 'none'
  strokeWidth: number
}

const OUTLINE_MIN_STROKE = 2

export function glyphPaint(which: 'a' | 'b', settings: MarkSettings): GlyphPaint {
  const solid =
    settings.ink === 'solid' ||
    (settings.ink === 'a-solid' && which === 'a') ||
    (settings.ink === 'b-solid' && which === 'b')
  if (solid) {
    return {
      fill: 'fg',
      stroke: settings.stroke > 0 ? 'fg' : 'none',
      strokeWidth: settings.stroke,
    }
  }
  return {
    fill: 'none',
    stroke: 'accent',
    strokeWidth: Math.max(settings.stroke, OUTLINE_MIN_STROKE),
  }
}

export function variation(weight: number, soft: number, opsz: number, wonk: boolean): string {
  return `"wght" ${weight}, "SOFT" ${soft}, "opsz" ${opsz}, "WONK" ${wonk ? 1 : 0}`
}

export function motionActive(drift: number, reduced: boolean): boolean {
  return !reduced && drift > 0
}

export function inkLabel(ink: Ink): string {
  switch (ink) {
    case 'solid':
      return 'Both solid'
    case 'outline':
      return 'Both outline'
    case 'a-solid':
      return 'Dmitry solid, Davis outline'
    case 'b-solid':
      return 'Davis solid, Dmitry outline'
  }
}

export function describeMark(state: MarkState): string {
  const settings = state.settings
  return `Dmitry weight ${Math.round(settings.weightA)}, Davis weight ${Math.round(settings.weightB)}, gap ${Math.round(settings.gap)}, ${inkLabel(settings.ink)}.`
}

export function readout(state: MarkState): string {
  const settings = state.settings
  return `Dmitry ${Math.round(settings.weightA)} · Davis ${Math.round(settings.weightB)} · gap ${Math.round(settings.gap)} · soft ${Math.round(settings.softA)}/${Math.round(settings.softB)}`
}
