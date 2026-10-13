import { Vector3 } from 'three'
import { BOARD_CENTER, STOP_LAYOUT, STOP_U } from './layout'
import { STOPS } from './stops'

/** Stop index used for the opening overview, before the first stop. */
export const INTRO = -1

// Scroll budget, in screen heights. Every stop gets a travel leg and then a hold where the
// camera stays parked so the card can be read.
const INTRO_UNITS = 0.8
const TRAVEL_UNITS = 1.3
const HOLD_UNITS = 1

const OVERVIEW_DISTANCE = 80
/** How far the camera pulls back mid-travel before zooming into the next stop. */
const TRAVEL_ZOOM_OUT = 6
/**
 * While parked, the camera keeps drifting this fraction closer, so every bit of scroll still
 * moves something and the page never feels stuck between stops.
 */
const HOLD_DOLLY = 0.08

type Segment = { from: number; to: number; fromStop: number; toStop: number }
type Keyframe = { u: number; focus: Vector3; distance: number }

const segments: Segment[] = []
let cursor = 0
function addSegment(units: number, fromStop: number, toStop: number) {
  segments.push({ from: cursor, to: cursor + units, fromStop, toStop })
  cursor += units
}
addSegment(INTRO_UNITS, INTRO, INTRO)
STOPS.forEach((_, i) => {
  addSegment(TRAVEL_UNITS, i - 1, i)
  addSegment(HOLD_UNITS, i, i)
})

/** Total scroll length in screen heights. */
export const TIMELINE_UNITS = cursor

const INTRO_KEYFRAME: Keyframe = { u: 0, focus: BOARD_CENTER, distance: OVERVIEW_DISTANCE }
const STOP_KEYFRAMES: Keyframe[] = STOP_LAYOUT.map((stop, i) => ({
  u: STOP_U[i],
  focus: stop.focus,
  distance: stop.distance,
}))

function keyframe(stop: number) {
  return stop === INTRO ? INTRO_KEYFRAME : STOP_KEYFRAMES[stop]
}

// Gentler than a cubic: peak speed mid-travel is about half, so a flick of the wheel doesn't
// whip the camera across the board.
function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export type StoryFrame = {
  /** Spark position along the path, 0–1 by arc length. */
  u: number
  focus: Vector3
  distance: number
  /** Stop the viewer is at, or INTRO. Mid-travel it flips halfway to the next stop. */
  stop: number
}

const frame: StoryFrame = { u: 0, focus: new Vector3(), distance: OVERVIEW_DISTANCE, stop: INTRO }
let lastProgress = Number.NaN

/**
 * Everything on screen is a pure function of scroll progress (0–1). The result is shared and
 * cached, so every scene component can call this each frame for free.
 */
export function sampleStory(progress: number): StoryFrame {
  if (progress === lastProgress) return frame
  lastProgress = progress

  const at = Math.min(Math.max(progress, 0), 1) * TIMELINE_UNITS
  const segment = segments.find((s) => at <= s.to) ?? segments[segments.length - 1]
  const t = (at - segment.from) / (segment.to - segment.from)
  const holding = segment.fromStop === segment.toStop
  const a = keyframe(segment.fromStop)
  const b = keyframe(segment.toStop)
  frame.stop = holding || t < 0.5 ? segment.fromStop : segment.toStop

  if (holding) {
    frame.u = a.u
    frame.focus.copy(a.focus)
    frame.distance = a.distance * (1 - HOLD_DOLLY * t)
    return frame
  }

  const eased = easeInOutSine(t)
  // sin² rather than sin: it starts and ends flat, so the pull-back doesn't kick at either end.
  const zoomOut = segment.fromStop === INTRO ? 0 : TRAVEL_ZOOM_OUT * Math.sin(Math.PI * t) ** 2
  frame.u = lerp(a.u, b.u, eased)
  frame.focus.lerpVectors(a.focus, b.focus, eased)
  // Leave from where the hold's dolly ended so there's no jump at the boundary.
  frame.distance = lerp(a.distance * (1 - HOLD_DOLLY), b.distance, eased) + zoomOut
  return frame
}

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1)
}

/**
 * How far the viewer is through one stop: `arrive` runs 0→1 over the travel leg into it (the
 * spark lands at 1), `hold` runs 0→1 while parked there. Drives the per-stop animations.
 */
export function stopPhase(progress: number, stop: number) {
  const at = clamp01(progress) * TIMELINE_UNITS
  // Segment 0 is the intro; after that each stop has a travel then a hold.
  const travel = segments[1 + stop * 2]
  const hold = segments[2 + stop * 2]
  return {
    arrive: clamp01((at - travel.from) / (travel.to - travel.from)),
    hold: clamp01((at - hold.from) / (hold.to - hold.from)),
  }
}

/** Scroll progress at the middle of a stop's hold, for jumping straight to it. */
export function progressForStop(stop: number) {
  const hold = segments.find((s) => s.fromStop === stop && s.toStop === stop)
  return hold ? (hold.from + hold.to) / 2 / TIMELINE_UNITS : 0
}
