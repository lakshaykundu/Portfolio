import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Suspense } from 'react'
import { Board } from './Board'
import { CameraRig } from './CameraRig'
import { Finale } from './Finale'
import { Path } from './Path'
import { Spark } from './Spark'
import { StoryNodes } from './StoryNodes'

const BACKGROUND = '#07070a'
// Phones and tablets skip multisampling, the most expensive part of the render on mobile GPUs,
// and use a higher pixel ratio instead: their screens are small and dense, so that costs about
// the same as desktop and keeps the 3D text crisp.
const TOUCH = window.matchMedia('(pointer: coarse)').matches

export function Experience() {
  return (
    // On desktop DPR is capped at 1.5: on large retina screens 2× nearly doubles the bloom pass's
    // cost for little visible gain, and dropped frames are what make scrolling feel rough.
    <Canvas
      dpr={[1, TOUCH ? 2 : 1.5]}
      camera={{ fov: 35, near: 0.5, far: 400 }}
      gl={{ antialias: false }}
    >
      <color attach="background" args={[BACKGROUND]} />
      {/* Near and far are set every frame by CameraRig to follow the camera's distance. */}
      <fog attach="fog" args={[BACKGROUND, 90, 190]} />

      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 20, 8]} intensity={0.6} />
      <directionalLight position={[-20, 10, -30]} color="#ff2d2d" intensity={0.8} />

      <CameraRig />
      <Board />
      <Path />
      <Spark />
      <Suspense fallback={null}>
        <StoryNodes />
        <Finale />
      </Suspense>

      <EffectComposer multisampling={TOUCH ? 0 : 4}>
        <Bloom mipmapBlur intensity={1.1} luminanceThreshold={1} />
        <Vignette offset={0.25} darkness={0.8} />
      </EffectComposer>
    </Canvas>
  )
}
