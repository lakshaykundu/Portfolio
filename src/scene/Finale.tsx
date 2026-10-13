import { Image, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  BoxGeometry,
  Color,
  EdgesGeometry,
  type Group,
  type LineBasicMaterial,
  MathUtils,
  type Mesh,
  PlaneGeometry,
  type PointLight,
  Vector3,
} from 'three'
import { getScrollProgress } from '../scroll/smoothScroll'
import { CAMERA_DIRECTION, CAMERA_YAW, STAND_HEIGHT, STOP_LAYOUT } from '../story/layout'
import { STOPS } from '../story/stops'
import { stopPhase } from '../story/timeline'
import { MONO_FONT } from './fonts'
import { BEHIND_EDGES } from './materials'

const FINALE = STOPS.length - 1
const RED = new Color(1, 0.1, 0.1)
const CARD = { width: 3.6, height: 4.5 } // the render is 1122×1402
/** Leans back a little, like a collectible on a display stand. */
const CARD_LEAN = 0.22
/** Stands behind the spot where the spark lands, so the spark stays visible in front of it. */
const CARD_SETBACK = 0.7
const STAND = { top: 2.2, bottom: 2.4 }
const PLAQUE = { width: 1.8, height: 0.34 }

// Horizontal unit vector pointing from the stand toward the camera.
const TOWARD_CAMERA = new Vector3(CAMERA_DIRECTION.x, 0, CAMERA_DIRECTION.z).normalize()

function Stand() {
  return (
    <group position-y={-STAND_HEIGHT}>
      <mesh position-y={STAND_HEIGHT / 2}>
        <cylinderGeometry args={[STAND.top, STAND.bottom, STAND_HEIGHT, 64]} />
        <meshStandardMaterial color="#111115" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position-y={STAND_HEIGHT + 0.01} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[STAND.top - 0.15, STAND.top, 64]} />
        <meshBasicMaterial color={RED.clone().multiplyScalar(1.8)} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** A nameplate on the front of the stand, like the one in the render. */
function Plaque() {
  const outline = useMemo(
    () => new EdgesGeometry(new BoxGeometry(PLAQUE.width, PLAQUE.height, 0.04)),
    [],
  )
  const radius = (STAND.top + STAND.bottom) / 2 + 0.04
  return (
    <group
      position={TOWARD_CAMERA.clone().multiplyScalar(radius).setY(-STAND_HEIGHT / 2)}
      rotation-y={CAMERA_YAW}
    >
      <mesh>
        <boxGeometry args={[PLAQUE.width, PLAQUE.height, 0.04]} />
        <meshStandardMaterial color="#1a1a20" metalness={0.8} roughness={0.3} {...BEHIND_EDGES} />
      </mesh>
      <lineSegments geometry={outline}>
        <lineBasicMaterial color={RED.clone().multiplyScalar(1.4)} toneMapped={false} />
      </lineSegments>
      <Text font={MONO_FONT} fontSize={0.17} letterSpacing={0.25} position-z={0.025} color="#ececf0">
        KICKBOXER
      </Text>
    </group>
  )
}

/**
 * The finale: the kickboxer render as a card on its stand. It stays dark until the spark lands,
 * then lights up, and it follows the pointer slightly. A 3D model can later replace the card
 * inside the `tilt` group.
 */
export function Finale() {
  const { anchor } = STOP_LAYOUT[FINALE]
  const tilt = useRef<Group>(null)
  const card = useRef<Mesh>(null)
  const frame = useRef<LineBasicMaterial>(null)
  const light = useRef<PointLight>(null)
  const frameGeometry = useMemo(
    () => new EdgesGeometry(new PlaneGeometry(CARD.width + 0.14, CARD.height + 0.14)),
    [],
  )

  useFrame(({ pointer }, delta) => {
    const { hold } = stopPhase(getScrollProgress(), FINALE)
    const lit = MathUtils.smoothstep(hold, 0, 0.35)
    // Linear colour, so 0.02 already reads as a dim silhouette on screen.
    ;(card.current?.material as { color?: Color } | undefined)?.color?.setScalar(0.02 + 0.98 * lit)
    frame.current?.color.copy(RED).multiplyScalar(0.4 + 2.6 * lit)
    if (light.current) light.current.intensity = lit * 18
    if (tilt.current) {
      tilt.current.rotation.y = MathUtils.damp(tilt.current.rotation.y, pointer.x * 0.22, 4, delta)
      tilt.current.rotation.x = MathUtils.damp(tilt.current.rotation.x, -pointer.y * 0.12, 4, delta)
    }
  })

  return (
    <group position={anchor}>
      <Stand />
      <Plaque />
      <group position={TOWARD_CAMERA.clone().multiplyScalar(-CARD_SETBACK)} rotation-y={CAMERA_YAW}>
        <group rotation-x={-CARD_LEAN}>
          <group ref={tilt} position-y={CARD.height / 2}>
            <Image
              ref={card}
              url="/images/kickboxer.jpg"
              scale={[CARD.width, CARD.height]}
              radius={0.08}
              transparent
              toneMapped={false}
            />
            <lineSegments geometry={frameGeometry} position-z={-0.01}>
              <lineBasicMaterial ref={frame} toneMapped={false} />
            </lineSegments>
          </group>
        </group>
        <pointLight ref={light} position={[0, CARD.height * 0.5, 2.5]} color="#ff5a5a" intensity={0} distance={12} />
      </group>
    </group>
  )
}
