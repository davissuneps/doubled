import { describe, expect, it } from 'vitest'
import {
  boing,
  centroid,
  gatePose,
  gateRest,
  jellyRest,
  pokeRube,
  quarterTurn,
  requestSend,
  rubeRest,
  stepGate,
  stepJelly,
  stepRube,
  stepSwarm,
  shoveSwarm,
  swarmSeed,
} from './cellar'

describe('updraft', () => {
  it('pulls the swarm toward a pointer and fans it away', () => {
    const start = swarmSeed()
    let called = start
    let fanned = start
    for (let i = 0; i < 50; i += 1) {
      called = stepSwarm(called, { dt: 0.016, pointer: { x: 1.2, y: 1 }, fan: false, nudge: false, reduced: false })
      fanned = stepSwarm(fanned, { dt: 0.016, pointer: { x: 1.2, y: 1 }, fan: true, nudge: false, reduced: false })
    }
    expect(centroid(called).x).toBeGreaterThan(centroid(start).x + 0.15)
    expect(centroid(fanned).x).toBeLessThan(centroid(start).x - 0.05)
  })

  it('nudges upward without a running loop when motion is reduced', () => {
    const start = swarmSeed()
    const nudged = stepSwarm(start, { dt: 0.016, pointer: null, fan: false, nudge: true, reduced: true })
    expect(nudged[0].y).toBeGreaterThan(start[0].y + 0.3)
    expect(nudged[0].vy).toBe(0)
    const shoved = shoveSwarm(start, { x: 1, y: 0 }, false, true)
    expect(shoved[0].x).toBeGreaterThan(start[0].x + 0.2)
  })
})

describe('jelly', () => {
  it('springs toward a squash and snaps when motion is reduced', () => {
    let jelly = jellyRest
    for (let i = 0; i < 160; i += 1) jelly = stepJelly(jelly, 0.6, 0, 0.016, false)
    expect(jelly.squash).toBeGreaterThan(0.45)
    expect(Math.abs(jelly.squash - 0.6)).toBeLessThan(0.08)
    const snapped = stepJelly(jellyRest, 0.8, 0.2, 0.016, true)
    expect(snapped).toMatchObject({ squash: 0.8, v: 0, shear: 0.2, sv: 0 })
  })

  it('boings back toward rest, or holds a squash when motion is reduced', () => {
    const moving = boing(jellyRest, false)
    expect(moving.jelly.v).toBeGreaterThan(5)
    expect(moving.targetSquash).toBe(0)
    const held = boing(jellyRest, true)
    expect(held.jelly.v).toBe(0)
    expect(held.jelly.squash).toBeGreaterThan(0.6)
  })
})

describe('portal', () => {
  it('sends the D through and turns the ring', () => {
    const reduced = requestSend(gateRest(), true)
    expect(reduced.gate.phase).toBe(1)
    expect(reduced.message).toContain('upside down')
    let gate = requestSend(gateRest(), false).gate
    for (let i = 0; i < 100; i += 1) gate = stepGate(gate, 0.016)
    expect(gate.phase).toBe(1)
    expect(gate.sending).toBe(false)
    const front = gatePose(0)
    const back = gatePose(1)
    expect(front.z).toBeGreaterThan(0)
    expect(back.z).toBeLessThan(0)
    expect(back.rotZ).toBeCloseTo(Math.PI)
    expect(back.scaleX).toBe(-1)
    expect(quarterTurn(gateRest()).yaw - gateRest().yaw).toBeCloseTo(Math.PI / 2)
  })
})

describe('chaos machine', () => {
  it('topples in order, and finishes immediately when motion is reduced', () => {
    let rube = pokeRube(rubeRest(), false).rube
    expect(rube.running).toBe(true)
    expect(pokeRube(rube, false).message).toContain('already')
    for (let i = 0; i < 20; i += 1) rube = stepRube(rube, 0.016)
    expect(rube.dominos[0]).toBeGreaterThan(rube.dominos[2])
    let sawFlyer = false
    for (let i = 0; i < 90 && rube.running; i += 1) {
      rube = stepRube(rube, 0.016)
      if (rube.flyerY > 0.15) sawFlyer = true
    }
    expect(sawFlyer).toBe(true)
    expect(rube.dominos[2]).toBe(1)
    const flat = pokeRube(rubeRest(), true)
    expect(flat.rube.dominos).toEqual([1, 1, 1])
    expect(flat.rube.running).toBe(false)
  })
})
