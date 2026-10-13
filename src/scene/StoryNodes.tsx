import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  BoxGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  type LineBasicMaterial,
  MathUtils,
  type MeshBasicMaterial,
} from 'three'
import { getScrollProgress, useCurrentStop } from '../scroll/smoothScroll'
import { getHoveredNode, useHoveredNode } from '../story/hover'
import { NODE_SIZE, type NodeLayout, STOP_LAYOUT } from '../story/layout'
import { sampleStory } from '../story/timeline'
import { MONO_FONT } from './fonts'
import { FocusGuardModel } from './heroes/FocusGuardModel'
import { ReactLearnModel } from './heroes/ReactLearnModel'
import { iconGeometry } from './iconGeometry'
import { BEHIND_EDGES } from './materials'

const RED = new Color(1, 0.1, 0.1)
// Brightness multipliers. Above ~1 the bloom pass starts to glow.
const GLOW = { idle: 0.6, current: 1.8, hovered: 3.2 }
// Turns flat items so their "right" runs along the board's diagonal, which reads as
// left → right from the fixed camera.
const FACE_CAMERA = Math.PI / 4
// The box is square to the world axes, so its nearest corner points at the camera. The label
// sits just past that corner, between the node and the path.
const NODE_LABEL_OFFSET = (NODE_SIZE.width + NODE_SIZE.depth) / 2 / Math.SQRT2 + 0.45
// Hero labels sit just in front of the floating model's shadow on the floor.
const HERO_LABEL_OFFSET = 3

function HeroModel({ node, stop }: { node: NodeLayout; stop: number }) {
  if (node.id === 'react-learn') return <ReactLearnModel stop={stop} />
  if (node.id === 'focusguard') return <FocusGuardModel />
  return null
}

function NodeLabel({ node, stop }: { node: NodeLayout; stop: number }) {
  const currentStop = useCurrentStop()
  const hoveredNode = useHoveredNode()
  const lit = currentStop === stop || hoveredNode === node.id
  return (
    <group rotation-y={FACE_CAMERA}>
      <Text
        font={MONO_FONT}
        fontSize={node.hero ? 0.38 : 0.3}
        letterSpacing={0.08}
        maxWidth={3.6}
        textAlign="center"
        anchorX="center"
        anchorY="top"
        position={[0, 0.02, node.hero ? HERO_LABEL_OFFSET : NODE_LABEL_OFFSET]}
        rotation-x={-Math.PI / 2}
        color={lit ? '#ececf0' : '#5a5a63'}
      >
        {node.label.toUpperCase()}
      </Text>
    </group>
  )
}

/** A plain node: a dark block with glowing edges and the project's icon on top. */
function NodeBlock({ node, stop }: { node: NodeLayout; stop: number }) {
  const { box, edges } = useMemo(() => {
    const box = new BoxGeometry(NODE_SIZE.width, NODE_SIZE.height, NODE_SIZE.depth)
    return { box, edges: new EdgesGeometry(box) }
  }, [])
  const edgeMaterial = useRef<LineBasicMaterial>(null)
  const iconMaterial = useRef<MeshBasicMaterial>(null)
  const glow = useRef(GLOW.idle)

  useFrame((_, delta) => {
    const target =
      getHoveredNode() === node.id
        ? GLOW.hovered
        : sampleStory(getScrollProgress()).stop === stop
          ? GLOW.current
          : GLOW.idle
    glow.current = MathUtils.damp(glow.current, target, 6, delta)
    edgeMaterial.current?.color.copy(RED).multiplyScalar(glow.current)
    iconMaterial.current?.color.copy(RED).multiplyScalar(glow.current * 1.6)
  })

  return (
    <>
      <group position-y={NODE_SIZE.height / 2}>
        <mesh geometry={box}>
          <meshStandardMaterial color="#121217" metalness={0.4} roughness={0.55} {...BEHIND_EDGES} />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial ref={edgeMaterial} color={RED} toneMapped={false} />
        </lineSegments>
      </group>
      <group rotation-y={FACE_CAMERA}>
        <mesh
          geometry={iconGeometry(node.icon)}
          position-y={NODE_SIZE.height + 0.02}
          rotation-x={-Math.PI / 2}
          scale={1.2}
        >
          <meshBasicMaterial ref={iconMaterial} color={RED} toneMapped={false} side={DoubleSide} />
        </mesh>
      </group>
    </>
  )
}

export function StoryNodes() {
  return STOP_LAYOUT.flatMap((stop, i) =>
    stop.nodes.map((node) => (
      <group key={node.id} position={node.position}>
        {node.hero ? <HeroModel node={node} stop={i} /> : <NodeBlock node={node} stop={i} />}
        <NodeLabel node={node} stop={i} />
      </group>
    )),
  )
}
