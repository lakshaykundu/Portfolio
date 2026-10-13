import { Grid } from '@react-three/drei'

export function Board() {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#09090c" roughness={1} />
      </mesh>
      <Grid
        infiniteGrid
        cellSize={1}
        cellThickness={0.6}
        cellColor="#16161b"
        sectionSize={6}
        sectionThickness={1}
        sectionColor="#2a1215"
        fadeDistance={140}
        fadeStrength={1.6}
      />
    </>
  )
}
