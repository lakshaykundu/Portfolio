import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { ShieldCheck } from 'lucide'
import { useMemo, useRef, useState } from 'react'
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  type Group,
  IcosahedronGeometry,
  type LineBasicMaterial,
  type MeshBasicMaterial,
  PlaneGeometry,
  type ShaderMaterial,
  type ShaderMaterialParameters,
  Vector3,
  Vector4,
} from 'three'
import { FACING_CAMERA } from '../../story/layout'
import { MONO_FONT } from '../fonts'
import { iconGeometry } from '../iconGeometry'
import { BEHIND_EDGES, RENDER_ORDER } from '../materials'

const RED = new Color(1, 0.1, 0.1)
const FLOAT_HEIGHT = 2.5
const SHIELD_RADIUS = 2.3
const SHIELD_X = -0.9
const POPUP_X = 2.4
const BROWSER = { width: 3.4, height: 2.2 }
const POPUP = { width: 1.3, height: 1.75 }
const SESSION_SECONDS = 25 * 60

// Plain tiles with site names, no logos. Each flies in, hits the shield and bounces off.
const SITES = ['instagram.com', 'netflix.com', 'youtube.com/shorts', 'reddit.com', 'x.com']
const TILE = { width: 1.25, height: 0.36 }
// One hit every TILE_PERIOD / SITES.length seconds (about 1.2 s). Faster than that, the ripples
// read as the shield strobing.
const TILE_PERIOD = 6
const HIT_AT = 0.55
const START_DISTANCE = 4.8

const MAX_RIPPLES = SITES.length
const RIPPLE_LIFE = 1.2

function shieldParameters(): ShaderMaterialParameters {
  return {
    uniforms: {
      uColor: { value: new Color(1, 0.12, 0.12) },
      uTime: { value: 0 },
      // xyz: direction of the hit from the shield's centre; w: when it happened.
      uRipples: { value: Array.from({ length: MAX_RIPPLES }, () => new Vector4(0, 1, 0, -100)) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - world.xyz);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uTime;
      uniform vec4 uRipples[${MAX_RIPPLES}];
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vDirection;
      void main() {
        // Brighter towards the silhouette, like a force field. Clamped because pow() of a
        // negative base is NaN, and a single NaN pixel spreads through the bloom pass and blacks
        // out the whole frame.
        float rim = pow(clamp(1.0 - abs(dot(vNormal, vViewDir)), 0.0, 1.0), 2.5);
        float ripple = 0.0;
        for (int i = 0; i < ${MAX_RIPPLES}; i++) {
          float age = uTime - uRipples[i].w;
          if (age < 0.0 || age > ${RIPPLE_LIFE.toFixed(1)}) continue;
          float angle = acos(clamp(dot(vDirection, uRipples[i].xyz), -1.0, 1.0));
          float fade = 1.0 - age / ${RIPPLE_LIFE.toFixed(1)};
          // smoothstep needs edge0 < edge1. Reversed edges are undefined and give NaN on Apple
          // GPUs, so invert the result instead.
          ripple += (1.0 - smoothstep(0.0, 0.25, abs(angle - age * 1.5))) * fade * fade;
        }
        // Kept soft: bright ripples get picked up by the bloom pass and flash.
        float alpha = 0.02 + rim * 0.3 + ripple * 0.3;
        gl_FragColor = vec4(uColor * (0.5 + rim * 1.2 + ripple * 1.1), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
    toneMapped: false,
  }
}

function tileStart(index: number) {
  // Spread the approach directions over the top of the shield (40°–140°), slightly in front of
  // it. Lower down they would cross the popup on the right, React-Learn on the left, or the floor.
  const angle = (Math.PI / 180) * (40 + (index / (SITES.length - 1)) * 100)
  return new Vector3(Math.cos(angle), Math.sin(angle) * 0.75, 0.25).normalize()
}

function Tiles({ onHit }: { onHit: (index: number, direction: Vector3) => void }) {
  const tiles = useRef<(Group | null)[]>([])
  const faces = useRef<(MeshBasicMaterial | null)[]>([])
  const outlines = useRef<(LineBasicMaterial | null)[]>([])
  const labels = useRef<({ fillOpacity: number } | null)[]>([])
  const lastT = useRef(SITES.map(() => 0))
  const directions = useMemo(() => SITES.map((_, i) => tileStart(i)), [])
  const outline = useMemo(() => new EdgesGeometry(new PlaneGeometry(TILE.width, TILE.height)), [])

  useFrame(({ clock }) => {
    SITES.forEach((_, i) => {
      const tile = tiles.current[i]
      if (!tile) return
      const t = ((clock.elapsedTime + (i * TILE_PERIOD) / SITES.length) % TILE_PERIOD) / TILE_PERIOD
      const direction = directions[i]
      let opacity: number
      if (t < HIT_AT) {
        // Accelerate in from outside until it touches the shield.
        const approach = (t / HIT_AT) ** 2
        const distance = START_DISTANCE + (SHIELD_RADIUS + 0.15 - START_DISTANCE) * approach
        tile.position.copy(direction).multiplyScalar(distance)
        tile.rotation.z = 0
        opacity = Math.min(t / 0.12, 1)
      } else {
        if (lastT.current[i] < HIT_AT) onHit(i, direction)
        // Knocked back out, spinning and fading.
        const bounce = (t - HIT_AT) / (1 - HIT_AT)
        tile.position
          .copy(direction)
          .multiplyScalar(SHIELD_RADIUS + 0.15 + bounce * 2.4)
          .add(new Vector3(0, bounce * bounce * -0.8, bounce * 0.6))
        tile.rotation.z = bounce * (i % 2 ? 2 : -2)
        opacity = 1 - bounce
      }
      lastT.current[i] = t
      tile.scale.setScalar(0.6 + opacity * 0.4)
      const face = faces.current[i]
      if (face) face.opacity = opacity * 0.9
      const outline = outlines.current[i]
      if (outline) outline.opacity = opacity
      const label = labels.current[i]
      if (label) label.fillOpacity = opacity
    })
  })

  return SITES.map((site, i) => (
    <group
      key={site}
      ref={(group) => {
        tiles.current[i] = group
      }}
    >
      <mesh renderOrder={RENDER_ORDER.tiles}>
        <planeGeometry args={[TILE.width, TILE.height]} />
        <meshBasicMaterial
          ref={(material) => {
            faces.current[i] = material
          }}
          color="#141418"
          transparent
          {...BEHIND_EDGES}
        />
      </mesh>
      <lineSegments geometry={outline} renderOrder={RENDER_ORDER.tiles}>
        <lineBasicMaterial
          ref={(material) => {
            outlines.current[i] = material
          }}
          color={RED.clone().multiplyScalar(1.6)}
          transparent
          toneMapped={false}
        />
      </lineSegments>
      <Text
        ref={(text: { fillOpacity: number } | null) => {
          labels.current[i] = text
        }}
        font={MONO_FONT}
        fontSize={0.11}
        position-z={0.01}
        renderOrder={RENDER_ORDER.tiles}
        color="#ececf0"
      >
        {site}
      </Text>
    </group>
  ))
}

function Browser({ blocked }: { blocked: number }) {
  const frame = useMemo(() => new EdgesGeometry(new BoxGeometry(BROWSER.width, BROWSER.height, 0.08)), [])
  const top = BROWSER.height / 2
  const left = -BROWSER.width / 2 + 0.2
  return (
    <group>
      <mesh>
        <boxGeometry args={[BROWSER.width, BROWSER.height, 0.08]} />
        <meshStandardMaterial color="#0d0d11" metalness={0.4} roughness={0.5} {...BEHIND_EDGES} />
      </mesh>
      <lineSegments geometry={frame}>
        <lineBasicMaterial color={RED.clone().multiplyScalar(1.4)} toneMapped={false} />
      </lineSegments>
      <group position-z={0.045}>
        {/* Toolbar: window dots and the address bar. */}
        <mesh position-y={top - 0.17}>
          <planeGeometry args={[BROWSER.width, 0.34]} />
          <meshBasicMaterial color="#17171d" />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[left + i * 0.14, top - 0.17, 0.005]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color={i === 0 ? '#ff4d4d' : '#3a3a44'} />
          </mesh>
        ))}
        <mesh position={[0.25, top - 0.17, 0.005]}>
          <planeGeometry args={[2.3, 0.18]} />
          <meshBasicMaterial color="#0a0a0d" />
        </mesh>
        <Text font={MONO_FONT} fontSize={0.09} position={[-0.8, top - 0.17, 0.01]} anchorX="left" color="#8a8a94">
          react.dev/learn
        </Text>
        {/* Page: an allowed tutorial, with the session status on top. */}
        <mesh
          geometry={iconGeometry(ShieldCheck)}
          position={[left + 0.18, 0.42, 0.01]}
          scale={0.36}
        >
          <meshBasicMaterial color={RED.clone().multiplyScalar(3)} toneMapped={false} side={DoubleSide} />
        </mesh>
        <Text font={MONO_FONT} fontSize={0.12} letterSpacing={0.1} position={[left + 0.45, 0.42, 0.01]} anchorX="left" color="#ff4d4d">
          FOCUS SESSION
        </Text>
        {[2.7, 2.2, 2.5, 1.6].map((width, i) => (
          <mesh key={i} position={[left + width / 2, 0.08 - i * 0.2, 0.005]}>
            <planeGeometry args={[width, 0.07]} />
            <meshBasicMaterial color="#25252c" />
          </mesh>
        ))}
        <Text font={MONO_FONT} fontSize={0.1} position={[left, -0.82, 0.01]} anchorX="left" color="#8a8a94">
          {`${blocked} distractions blocked`}
        </Text>
      </group>
    </group>
  )
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function Popup() {
  const frame = useMemo(() => new EdgesGeometry(new BoxGeometry(POPUP.width, POPUP.height, 0.06)), [])
  const [remaining, setRemaining] = useState(SESSION_SECONDS)
  useFrame(({ clock }) => {
    const next = SESSION_SECONDS - (Math.floor(clock.elapsedTime) % SESSION_SECONDS)
    if (next !== remaining) setRemaining(next)
  })
  const fraction = remaining / SESSION_SECONDS

  return (
    <group position-x={POPUP_X}>
      <mesh>
        <boxGeometry args={[POPUP.width, POPUP.height, 0.06]} />
        <meshStandardMaterial color="#0d0d11" metalness={0.4} roughness={0.5} {...BEHIND_EDGES} />
      </mesh>
      <lineSegments geometry={frame}>
        <lineBasicMaterial color={RED.clone().multiplyScalar(1.4)} toneMapped={false} />
      </lineSegments>
      <group position-z={0.035}>
        <Text font={MONO_FONT} fontSize={0.11} position-y={0.66} color="#ececf0">
          FocusGuard
        </Text>
        <mesh position-y={0.02}>
          <ringGeometry args={[0.4, 0.46, 64]} />
          <meshBasicMaterial color="#25252c" />
        </mesh>
        <mesh position={[0, 0.02, 0.003]}>
          <ringGeometry args={[0.4, 0.46, 64, 1, Math.PI / 2, Math.PI * 2 * fraction]} />
          <meshBasicMaterial color={RED.clone().multiplyScalar(2.5)} toneMapped={false} />
        </mesh>
        <Text font={MONO_FONT} fontSize={0.2} position={[0, 0.02, 0.005]} color="#ececf0">
          {formatCountdown(remaining)}
        </Text>
        <Text font={MONO_FONT} fontSize={0.08} letterSpacing={0.15} position-y={-0.66} color="#ff4d4d">
          STRICT MODE
        </Text>
      </group>
    </group>
  )
}

/** FocusGuard: a browser under a force-field shield that distracting sites bounce off. */
export function FocusGuardModel() {
  // Created once; the material is then driven through its ref like the other materials here.
  const [shieldArgs] = useState(() => [shieldParameters()] as const)
  const shield = useRef<ShaderMaterial>(null)
  const lattice = useMemo(() => new EdgesGeometry(new IcosahedronGeometry(SHIELD_RADIUS, 2)), [])
  const float = useRef<Group>(null)
  const [blocked, setBlocked] = useState(12)

  const onHit = (index: number, direction: Vector3) => {
    const uniforms = shield.current?.uniforms
    if (uniforms) {
      const ripple = uniforms.uRipples.value[index] as Vector4
      ripple.set(direction.x, direction.y, direction.z, uniforms.uTime.value)
    }
    setBlocked((count) => count + 1)
  }

  useFrame(({ clock }) => {
    if (shield.current) shield.current.uniforms.uTime.value = clock.elapsedTime
    if (float.current) float.current.position.y = FLOAT_HEIGHT + Math.sin(clock.elapsedTime * 0.7 + 1) * 0.06
  })

  return (
    <group ref={float}>
      <group quaternion={FACING_CAMERA}>
        <group position-x={SHIELD_X}>
          <Browser blocked={blocked} />
          <mesh renderOrder={RENDER_ORDER.shield}>
            <sphereGeometry args={[SHIELD_RADIUS, 64, 32]} />
            <shaderMaterial ref={shield} args={shieldArgs} />
          </mesh>
          <lineSegments geometry={lattice} renderOrder={RENDER_ORDER.shield}>
            <lineBasicMaterial color={RED} transparent opacity={0.18} toneMapped={false} />
          </lineSegments>
          <Tiles onHit={onHit} />
        </group>
        <Popup />
      </group>
    </group>
  )
}
