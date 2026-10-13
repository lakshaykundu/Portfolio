import { CatmullRomCurve3, Matrix4, Quaternion, Vector3 } from 'three'
import { STOPS, type StoryNode } from './stops'

// Forward in time runs along the board's diagonal, which the fixed camera sees as left → right.
export const FORWARD = new Vector3(1, 0, -1).normalize()
// Points toward the camera (down on screen). Nodes sit on the far side of the path so it never
// hides them.
export const SIDEWAYS = new Vector3(1, 0, 1).normalize()

/** Fixed viewing angle: up and to the front-right of the board, like a tabletop diorama. */
export const CAMERA_DIRECTION = new Vector3(1, 1.15, 1.25).normalize()
/** Turns an object's front (+Z) to face the camera head-on. Used for the floating models. */
export const FACING_CAMERA = new Quaternion().setFromRotationMatrix(
  new Matrix4().lookAt(CAMERA_DIRECTION, new Vector3(), new Vector3(0, 1, 0)),
)
/** Yaw that turns an object's front (+Z) toward the camera while it stays upright. */
export const CAMERA_YAW = Math.atan2(CAMERA_DIRECTION.x, CAMERA_DIRECTION.z)

export const PATH_HEIGHT = 0.12
/** Top of the kickboxer's stand. The path climbs onto it so the spark lands on top. */
export const STAND_HEIGHT = 0.6
export const NODE_SIZE = { width: 2.6, height: 1.4, depth: 2.6 }
/** Width of a hero model (React-Learn, FocusGuard) as seen from the camera. */
const HERO_WIDTH = 6.4

const NODE_SETBACK = 5
const NODE_GAP = 4.2
const HERO_GAP = 8.5
const PATH_START = -10
/** The hero models float, so the camera aims up at them rather than at the floor. */
const HERO_FOCUS = { height: 2, setback: NODE_SETBACK * 0.75 }
/** The camera aims at the middle of the kickboxer card, which stands on the stand. */
const FINALE_FOCUS_HEIGHT = 2.6
const FINALE_DISTANCE = 15

export type NodeLayout = StoryNode & { position: Vector3 }

export type StopLayout = {
  /** Where the path passes through this stop. */
  anchor: Vector3
  /** What the camera looks at while parked here. */
  focus: Vector3
  /** Camera distance while parked here, wide enough to fit every node. */
  distance: number
  nodes: NodeLayout[]
}

function boardPoint(along: number, side: number, height = 0) {
  return FORWARD.clone().multiplyScalar(along).addScaledVector(SIDEWAYS, side).setY(height)
}

export const STOP_LAYOUT: StopLayout[] = STOPS.map((stop, i) => {
  const isFinale = i === STOPS.length - 1
  const hasHero = stop.nodes.some((node) => node.hero)
  const gap = hasHero ? HERO_GAP : NODE_GAP
  const nodeWidth = hasHero ? HERO_WIDTH : NODE_SIZE.width
  const nodes = stop.nodes.map((node, index) => {
    const offset = (index - (stop.nodes.length - 1) / 2) * gap
    return { ...node, position: boardPoint(stop.along + offset, stop.side - NODE_SETBACK) }
  })
  const span = (nodes.length - 1) * gap + nodeWidth
  if (isFinale) {
    return {
      anchor: boardPoint(stop.along, stop.side, STAND_HEIGHT),
      focus: boardPoint(stop.along, stop.side, FINALE_FOCUS_HEIGHT),
      distance: FINALE_DISTANCE,
      nodes,
    }
  }
  return {
    anchor: boardPoint(stop.along, stop.side, PATH_HEIGHT),
    focus: hasHero
      ? boardPoint(stop.along, stop.side - HERO_FOCUS.setback, HERO_FOCUS.height)
      : boardPoint(stop.along, stop.side - NODE_SETBACK / 2),
    // The hero models stand up and face the camera, so they can be framed tighter than the
    // flat nodes.
    distance: hasHero ? 12 + span * 0.85 : 14 + span * 0.9,
    nodes,
  }
})

export const PATH_CURVE = new CatmullRomCurve3(
  [boardPoint(PATH_START, 0, PATH_HEIGHT), ...STOP_LAYOUT.map((stop) => stop.anchor)],
  false,
  'centripetal',
)

const SAMPLES = 2000
const pathSamples = Array.from({ length: SAMPLES + 1 }, (_, i) => PATH_CURVE.getPointAt(i / SAMPLES))

/**
 * Arc-length position (0–1) of each stop on the path. Stops are the curve's control points, so
 * the nearest dense sample lands on them.
 */
export const STOP_U = STOP_LAYOUT.map(({ anchor }) => {
  let best = 0
  let bestDistance = Infinity
  pathSamples.forEach((point, i) => {
    const distance = point.distanceToSquared(anchor)
    if (distance < bestDistance) {
      bestDistance = distance
      best = i
    }
  })
  return best / SAMPLES
})

export const BOARD_CENTER = STOP_LAYOUT.reduce((sum, stop) => sum.add(stop.anchor), new Vector3())
  .divideScalar(STOP_LAYOUT.length)
  .setY(0)
