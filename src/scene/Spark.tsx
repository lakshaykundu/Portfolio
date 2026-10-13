import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Color, type Group } from 'three'
import { getScrollProgress } from '../scroll/smoothScroll'
import { PATH_CURVE } from '../story/layout'
import { sampleStory } from '../story/timeline'

const HOVER = 0.45
const CORE = new Color(9, 3, 3)
const HALO = new Color(3, 0.2, 0.2)

export function Spark() {
  const group = useRef<Group>(null)
  const halo = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!group.current || !halo.current) return
    const { u } = sampleStory(getScrollProgress())
    PATH_CURVE.getPointAt(u, group.current.position)
    group.current.position.y += HOVER
    halo.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.12)
  })

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color={CORE} toneMapped={false} />
      </mesh>
      <group ref={halo}>
        <mesh>
          <sphereGeometry args={[0.32, 24, 24]} />
          <meshBasicMaterial color={HALO} toneMapped={false} transparent opacity={0.35} />
        </mesh>
      </group>
      <pointLight color="#ff2d2d" intensity={30} distance={14} decay={2} />
    </group>
  )
}
