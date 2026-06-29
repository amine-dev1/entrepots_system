import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 180
const BOUNDS = { x: 8, y: 5, z: 4 }
const CONNECTION_DIST = 2.5
const MAX_LINES = 500
const COLORS = [
  new THREE.Color('#3b82f6'),
  new THREE.Color('#2563eb'),
  new THREE.Color('#60a5fa'),
]

function makeGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.6)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  return new THREE.CanvasTexture(canvas)
}

export default function ParticleField() {
  const groupRef = useRef()
  const pointsRef = useRef()
  const linesRef = useRef()
  const { pointer } = useThree()

  const { positions, colors, velocities, texture, linePositions } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const col = new Float32Array(PARTICLE_COUNT * 3)
    const vel = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * BOUNDS.x * 2
      pos[i3 + 1] = (Math.random() - 0.5) * BOUNDS.y * 2
      pos[i3 + 2] = (Math.random() - 0.5) * BOUNDS.z * 2

      vel[i3] = (Math.random() - 0.5) * 0.008
      vel[i3 + 1] = (Math.random() - 0.5) * 0.008
      vel[i3 + 2] = (Math.random() - 0.5) * 0.004

      const c = COLORS[Math.floor(Math.random() * COLORS.length)]
      col[i3] = c.r
      col[i3 + 1] = c.g
      col[i3 + 2] = c.b
    }

    return {
      positions: pos,
      colors: col,
      velocities: vel,
      texture: makeGlowTexture(),
      linePositions: new Float32Array(MAX_LINES * 2 * 3),
    }
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current || !linesRef.current || !groupRef.current) return

    const dt = Math.min(delta, 0.05) * 60
    const posAttr = pointsRef.current.geometry.attributes.position
    const arr = posAttr.array

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      arr[i3] += velocities[i3] * dt
      arr[i3 + 1] += velocities[i3 + 1] * dt
      arr[i3 + 2] += velocities[i3 + 2] * dt

      if (Math.abs(arr[i3]) > BOUNDS.x) velocities[i3] *= -1
      if (Math.abs(arr[i3 + 1]) > BOUNDS.y) velocities[i3 + 1] *= -1
      if (Math.abs(arr[i3 + 2]) > BOUNDS.z) velocities[i3 + 2] *= -1
    }
    posAttr.needsUpdate = true

    let lineIdx = 0
    const lp = linePositions
    for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_LINES; i++) {
      const i3 = i * 3
      for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_LINES; j++) {
        const j3 = j * 3
        const dx = arr[i3] - arr[j3]
        const dy = arr[i3 + 1] - arr[j3 + 1]
        const dz = arr[i3 + 2] - arr[j3 + 2]
        const dist = dx * dx + dy * dy + dz * dz
        if (dist < CONNECTION_DIST * CONNECTION_DIST) {
          const off = lineIdx * 6
          lp[off] = arr[i3]
          lp[off + 1] = arr[i3 + 1]
          lp[off + 2] = arr[i3 + 2]
          lp[off + 3] = arr[j3]
          lp[off + 4] = arr[j3 + 1]
          lp[off + 5] = arr[j3 + 2]
          lineIdx++
        }
      }
    }

    const lineGeo = linesRef.current.geometry
    lineGeo.attributes.position.needsUpdate = true
    lineGeo.setDrawRange(0, lineIdx * 2)

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.08,
      0.05
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointer.y * 0.05,
      0.05
    )
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={PARTICLE_COUNT} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={colors} count={PARTICLE_COUNT} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          map={texture}
          vertexColors
          size={0.12}
          sizeAttenuation
          transparent
          opacity={0.6}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={linePositions} count={MAX_LINES * 2} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.15}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}
