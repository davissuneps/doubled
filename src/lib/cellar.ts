export type Body = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
}

export type Jelly = { squash: number; v: number; shear: number; sv: number }

export type Gate = { yaw: number; pitch: number; phase: number; sending: boolean }

export type Rube = {
  hammer: number
  dominos: [number, number, number]
  flyerY: number
  t: number
  running: boolean
}

const BOX = 1.45

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function swarmSeed(): Body[] {
  const bodies: Body[] = []
  for (let i = 0; i < 14; i += 1) {
    const col = i % 4
    const row = Math.floor(i / 4)
    bodies.push({
      x: (col - 1.5) * 0.58,
      y: (row - 1.3) * 0.5,
      z: ((i % 3) - 1) * 0.28,
      vx: 0,
      vy: 0,
      vz: 0,
    })
  }
  return bodies
}

function bounce(value: number, velocity: number, min: number, max: number) {
  if (value < min) return { value: min, velocity: Math.abs(velocity) * 0.3 }
  if (value > max) return { value: max, velocity: -Math.abs(velocity) * 0.3 }
  return { value, velocity }
}

export function stepSwarm(
  bodies: Body[],
  opts: {
    dt: number
    pointer: { x: number; y: number } | null
    fan: boolean
    nudge: boolean
    reduced: boolean
  },
): Body[] {
  const dt = clamp(opts.dt, 0, 0.033)
  return bodies.map((body) => {
    let { x, y, z, vx, vy, vz } = body
    if (opts.pointer) {
      const dx = opts.pointer.x - x
      const dy = opts.pointer.y - y
      const dist = Math.hypot(dx, dy) + 0.22
      if (opts.reduced) {
        const step = opts.fan ? -0.16 : 0.2
        x += (dx / dist) * step
        y += (dy / dist) * step
        vx = 0
        vy = 0
        vz = 0
      } else {
        const sign = opts.fan ? -1 : 1
        vx += (dx / dist) * sign * 8 * dt
        vy += (dy / dist) * sign * 8 * dt
      }
    }
    if (opts.nudge) {
      if (opts.reduced) y += 0.42
      else vy += 2.4
    }
    if (!opts.reduced) {
      const drag = Math.exp(-2.1 * dt)
      vx = clamp(vx * drag, -3.2, 3.2)
      vy = clamp(vy * drag, -3.2, 3.2)
      vz = clamp(vz * Math.exp(-1.4 * dt), -1.5, 1.5)
      x += vx * dt
      y += vy * dt
      z += vz * dt
    }
    const xb = bounce(x, vx, -BOX, BOX)
    const yb = bounce(y, vy, -BOX, BOX)
    x = xb.value
    vx = xb.velocity
    y = yb.value
    vy = yb.velocity
    z = clamp(z, -0.7, 0.7)
    return { x, y, z, vx, vy, vz }
  })
}

export function shoveSwarm(bodies: Body[], dir: { x: number; y: number }, fan: boolean, reduced: boolean): Body[] {
  const sign = fan ? -1 : 1
  return bodies.map((body) => {
    if (reduced) {
      return {
        ...body,
        x: clamp(body.x + dir.x * sign * 0.38, -BOX, BOX),
        y: clamp(body.y + dir.y * sign * 0.38, -BOX, BOX),
        vx: 0,
        vy: 0,
        vz: 0,
      }
    }
    return {
      ...body,
      vx: clamp(body.vx + dir.x * sign * 2.4, -3.2, 3.2),
      vy: clamp(body.vy + dir.y * sign * 2.4, -3.2, 3.2),
    }
  })
}

export function centroid(bodies: Body[]): { x: number; y: number } {
  const total = bodies.reduce((sum, body) => ({ x: sum.x + body.x, y: sum.y + body.y }), { x: 0, y: 0 })
  return { x: total.x / bodies.length, y: total.y / bodies.length }
}

export const jellyRest: Jelly = { squash: 0, v: 0, shear: 0, sv: 0 }

export function stepJelly(
  jelly: Jelly,
  targetSquash: number,
  targetShear: number,
  dt: number,
  reduced: boolean,
): Jelly {
  const squashTarget = clamp(targetSquash, 0, 0.86)
  const shearTarget = clamp(targetShear, -0.55, 0.55)
  if (reduced) return { squash: squashTarget, v: 0, shear: shearTarget, sv: 0 }
  const step = clamp(dt, 0, 0.033)
  const stiffness = 32
  const damping = 8
  const v = jelly.v + (-stiffness * (jelly.squash - squashTarget) - damping * jelly.v) * step
  const sv = jelly.sv + (-stiffness * (jelly.shear - shearTarget) - damping * jelly.sv) * step
  return {
    squash: clamp(jelly.squash + v * step, 0, 0.9),
    v,
    shear: clamp(jelly.shear + sv * step, -0.65, 0.65),
    sv,
  }
}

export function boing(jelly: Jelly, reduced: boolean): { jelly: Jelly; targetSquash: number } {
  if (reduced) return { jelly: { ...jelly, squash: 0.72, v: 0, shear: 0, sv: 0 }, targetSquash: 0.72 }
  return { jelly: { ...jelly, squash: Math.min(0.86, jelly.squash + 0.2), v: jelly.v + 8.5 }, targetSquash: 0 }
}

export function gateRest(): Gate {
  return { yaw: 0.4, pitch: 0.15, phase: 0, sending: false }
}

export function aimGate(gate: Gate, dyaw: number, dpitch: number): Gate {
  return { ...gate, yaw: gate.yaw + dyaw, pitch: clamp(gate.pitch + dpitch, -1, 1) }
}

export function quarterTurn(gate: Gate): Gate {
  return { ...gate, yaw: gate.yaw + Math.PI / 2 }
}

export function requestSend(gate: Gate, reduced: boolean): { gate: Gate; message: string } {
  if (gate.phase >= 0.999 && !gate.sending) {
    if (reduced) {
      return { gate, message: 'Already through. Reset the portal to send it again.' }
    }
    return { gate: { ...gate, phase: 0, sending: true }, message: 'Sending another D through.' }
  }
  if (reduced) {
    return {
      gate: { ...gate, phase: 1, sending: false },
      message: 'Sent through. It came out upside down.',
    }
  }
  return { gate: { ...gate, sending: true }, message: 'Sending a D through.' }
}

export function stepGate(gate: Gate, dt: number): Gate {
  if (!gate.sending) return gate
  const phase = Math.min(1, gate.phase + clamp(dt, 0, 0.033) * 0.9)
  return { ...gate, phase, sending: phase < 1 }
}

export function gatePose(phase: number): { x: number; y: number; z: number; rotZ: number; scaleX: number } {
  const pinch = phase > 0.42 && phase < 0.58
  return {
    x: Math.sin(phase * Math.PI) * 0.08,
    y: Math.sin(phase * Math.PI * 2) * 0.08,
    z: 1.55 - phase * 3.1,
    rotZ: phase * Math.PI,
    scaleX: pinch ? 0.2 : phase < 0.5 ? 1 : -1,
  }
}

export function rubeRest(): Rube {
  return { hammer: 0, dominos: [0, 0, 0], flyerY: 0, t: 0, running: false }
}

function ramp(t: number, start: number, end: number): number {
  if (t <= start) return 0
  if (t >= end) return 1
  const u = (t - start) / (end - start)
  return u * u * (3 - 2 * u)
}

export function pokeRube(rube: Rube, reduced: boolean): { rube: Rube; message: string } {
  if (rube.running) return { rube, message: 'The hammer is already mid-swing.' }
  if (reduced) {
    return {
      rube: { hammer: 1, dominos: [1, 1, 1], flyerY: 0, t: 1.5, running: false },
      message: 'Poked. The dominos are already on the floor.',
    }
  }
  return { rube: { ...rubeRest(), running: true }, message: 'Poked. The hammer started it.' }
}

export function stepRube(rube: Rube, dt: number): Rube {
  if (!rube.running) return rube
  const t = rube.t + clamp(dt, 0, 0.033)
  const launch = t > 0.72 && t < 1.28
  const u = t - 0.72
  const flyerY = launch ? Math.max(0, 2.15 * u - 3.1 * u * u) : 0
  return {
    hammer: ramp(t, 0.04, 0.28),
    dominos: [ramp(t, 0.22, 0.4), ramp(t, 0.38, 0.56), ramp(t, 0.52, 0.7)],
    flyerY,
    t,
    running: t < 1.45,
  }
}
