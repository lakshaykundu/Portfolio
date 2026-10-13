import { Line, Text, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import {
  BoxGeometry,
  Color,
  EdgesGeometry,
  type Group,
  type LineBasicMaterial,
  MathUtils,
  type MeshBasicMaterial,
  SRGBColorSpace,
} from 'three'
import type { Line2 } from 'three-stdlib'
import { getScrollProgress } from '../../scroll/smoothScroll'
import { FACING_CAMERA } from '../../story/layout'
import { stopPhase } from '../../story/timeline'
import { MONO_FONT } from '../fonts'
import { BEHIND_EDGES } from '../materials'

const RED = new Color(1, 0.1, 0.1)
const SCREEN = { width: 3.6, height: 2.25 } // 16:10, like the 1440×900 screenshot
const FLOAT_HEIGHT = 2.1

// The same component tree as React-Learn's setState lesson. Positions are in the model's
// camera-facing plane.
type TreeNodeId = 'app' | 'header' | 'counter' | 'span' | 'button'
const TREE: { id: TreeNodeId; label: string; x: number; y: number; parent?: TreeNodeId }[] = [
  { id: 'app', label: '<App>', x: 0, y: 0.95 },
  { id: 'header', label: '<Header>', x: -0.55, y: 0.25, parent: 'app' },
  { id: 'counter', label: '<Counter>', x: 0.55, y: 0.25, parent: 'app' },
  { id: 'span', label: '<span>', x: 0.05, y: -0.45, parent: 'counter' },
  { id: 'button', label: '<button>', x: 1.0, y: -0.45, parent: 'counter' },
]
const TREE_X = -2.2
const MONITOR_X = 1.2
const PILL = { width: 0.88, height: 0.3, depth: 0.06 }

// One click, played out as you scroll through the stop: the button is clicked, only Counter
// re-renders (App and Header bail out), the diff finds the changed <span>, and the screen updates.
const PHASES = ['CLICK', 'RENDER', 'DIFF', 'COMMIT'] as const
const PHASE_GLOW: Record<(typeof PHASES)[number], Partial<Record<TreeNodeId, number>>> = {
  CLICK: { button: 3 },
  RENDER: { counter: 3, span: 1.2, button: 1.2 },
  DIFF: { span: 3, counter: 1.2 },
  COMMIT: { span: 1.2 },
}
const IDLE = 0.5

function phaseAt(hold: number) {
  return PHASES[Math.min(Math.floor(hold * PHASES.length), PHASES.length - 1)]
}

function TreeNode({ node, glow }: { node: (typeof TREE)[number]; glow: (id: TreeNodeId) => number }) {
  const edges = useMemo(
    () => new EdgesGeometry(new BoxGeometry(PILL.width, PILL.height, PILL.depth)),
    [],
  )
  const material = useRef<LineBasicMaterial>(null)
  const level = useRef(IDLE)
  useFrame((_, delta) => {
    level.current = MathUtils.damp(level.current, glow(node.id), 8, delta)
    material.current?.color.copy(RED).multiplyScalar(level.current)
  })
  return (
    <group position={[node.x, node.y, 0]}>
      <mesh>
        <boxGeometry args={[PILL.width, PILL.height, PILL.depth]} />
        <meshStandardMaterial color="#121217" {...BEHIND_EDGES} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={material} color={RED} toneMapped={false} />
      </lineSegments>
      <Text font={MONO_FONT} fontSize={0.11} position-z={PILL.depth / 2 + 0.005} color="#ececf0">
        {node.label}
      </Text>
    </group>
  )
}

function TreeLink({ from, to, glow }: { from: TreeNodeId; to: TreeNodeId; glow: (id: TreeNodeId) => number }) {
  const line = useRef<Line2>(null)
  const level = useRef(IDLE)
  const a = TREE.find((node) => node.id === from)!
  const b = TREE.find((node) => node.id === to)!
  useFrame((_, delta) => {
    level.current = MathUtils.damp(level.current, Math.min(glow(from), glow(to)), 8, delta)
    line.current?.material.color.copy(RED).multiplyScalar(Math.max(level.current, 0.35))
  })
  return (
    <Line
      ref={line}
      points={[
        [a.x, a.y - PILL.height / 2, 0],
        [b.x, b.y + PILL.height / 2, 0],
      ]}
      lineWidth={1.5}
      toneMapped={false}
    />
  )
}

/** React-Learn: a floating monitor with the real app on screen, beside its component tree. */
export function ReactLearnModel({ stop }: { stop: number }) {
  const screenshot = useTexture('/images/react-learn.jpg', (texture) => {
    texture.colorSpace = SRGBColorSpace
  })
  const bezelEdges = useMemo(() => new EdgesGeometry(new BoxGeometry(3.8, 2.45, 0.12)), [])
  const screen = useRef<MeshBasicMaterial>(null)
  const float = useRef<Group>(null)
  const [phase, setPhase] = useState<(typeof PHASES)[number]>('CLICK')
  const phaseRef = useRef(phase)

  const glow = (id: TreeNodeId) => PHASE_GLOW[phaseRef.current][id] ?? IDLE

  useFrame(({ clock }) => {
    const { hold } = stopPhase(getScrollProgress(), stop)
    const next = phaseAt(hold)
    if (next !== phaseRef.current) {
      phaseRef.current = next
      setPhase(next)
    }
    // The screen flashes as the commit lands, then settles.
    const commit = MathUtils.clamp((hold - 0.75) / 0.25, 0, 1)
    screen.current?.color.setScalar(0.8 + Math.sin(commit * Math.PI) * 0.7)
    if (float.current) float.current.position.y = FLOAT_HEIGHT + Math.sin(clock.elapsedTime * 0.8) * 0.06
  })

  return (
    <group ref={float}>
      <group quaternion={FACING_CAMERA}>
        <group position-x={MONITOR_X}>
          <mesh>
            <boxGeometry args={[3.8, 2.45, 0.12]} />
            <meshStandardMaterial color="#0d0d11" metalness={0.5} roughness={0.4} {...BEHIND_EDGES} />
          </mesh>
          <lineSegments geometry={bezelEdges}>
            <lineBasicMaterial color={RED.clone().multiplyScalar(1.4)} toneMapped={false} />
          </lineSegments>
          <mesh position-z={0.065}>
            <planeGeometry args={[SCREEN.width, SCREEN.height]} />
            <meshBasicMaterial ref={screen} map={screenshot} toneMapped={false} />
          </mesh>
          <group position-y={-1.55}>
            {PHASES.map((name, i) => (
              <Text
                key={name}
                font={MONO_FONT}
                fontSize={0.15}
                letterSpacing={0.12}
                position-x={(i - 1.5) * 1.0}
                color={name === phase ? '#ff4d4d' : '#5a5a63'}
              >
                {/* The font's Latin subset has no →, so a guillemet stands in. */}
                {i < PHASES.length - 1 ? `${name}  ›` : name}
              </Text>
            ))}
          </group>
        </group>
        <group position={[TREE_X, -0.25, 0]}>
          {TREE.map((node) =>
            node.parent ? <TreeLink key={node.id} from={node.parent} to={node.id} glow={glow} /> : null,
          )}
          {TREE.map((node) => (
            <TreeNode key={node.id} node={node} glow={glow} />
          ))}
        </group>
      </group>
    </group>
  )
}
