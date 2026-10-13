import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, type MeshBasicMaterial, TubeGeometry } from 'three'
import { getScrollProgress } from '../scroll/smoothScroll'
import { PATH_CURVE, STOP_LAYOUT, STOP_U } from '../story/layout'
import { sampleStory } from '../story/timeline'

const TUBULAR_SEGMENTS = 800
const RADIAL_SEGMENTS = 6
const INDICES_PER_SEGMENT = RADIAL_SEGMENTS * 6

// Values above 1 are what the bloom pass picks up as glow.
const NEON = new Color(4, 0.35, 0.35)
const DIM = new Color('#3a1215')

/** The road ahead is dim; everything behind the spark is lit, so the path doubles as its trail. */
export function Path() {
  const dimGeometry = useMemo(
    () => new TubeGeometry(PATH_CURVE, TUBULAR_SEGMENTS, 0.07, RADIAL_SEGMENTS, false),
    [],
  )
  const litGeometry = useMemo(
    () => new TubeGeometry(PATH_CURVE, TUBULAR_SEGMENTS, 0.085, RADIAL_SEGMENTS, false),
    [],
  )
  const markers = useRef<(MeshBasicMaterial | null)[]>([])

  useFrame(() => {
    const { u } = sampleStory(getScrollProgress())
    litGeometry.setDrawRange(0, Math.floor(u * TUBULAR_SEGMENTS) * INDICES_PER_SEGMENT)
    markers.current.forEach((material, i) => {
      material?.color.copy(u >= STOP_U[i] - 0.001 ? NEON : DIM)
    })
  })

  return (
    <>
      <mesh geometry={dimGeometry}>
        <meshBasicMaterial color={DIM} />
      </mesh>
      <mesh geometry={litGeometry}>
        <meshBasicMaterial color={NEON} toneMapped={false} />
      </mesh>
      {STOP_LAYOUT.map((stop, i) => (
        <mesh key={i} position={stop.anchor} position-y={0.02} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.55, 0.7, 48]} />
          <meshBasicMaterial
            ref={(material) => {
              markers.current[i] = material
            }}
            color={DIM}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  )
}
