import { Canvas } from '@react-three/fiber'
import ParticleField from './ParticleField'

export default function LoginBackground() {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
        eventSource={document.documentElement}
        eventPrefix="client"
        fallback={null}
      >
        <ParticleField />
      </Canvas>
    </div>
  )
}
