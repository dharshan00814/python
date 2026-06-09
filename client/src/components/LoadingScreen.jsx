import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function Spinner() {
  const mesh = useRef();

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.8;
      mesh.current.rotation.y = state.clock.elapsedTime * 1.1;
    }
  });

  return (
    <mesh ref={mesh}>
      <torusKnotGeometry args={[0.82, 0.24, 140, 16]} />
      <meshStandardMaterial color="#66d9ff" emissive="#9d7dff" emissiveIntensity={0.45} metalness={0.8} roughness={0.15} />
    </mesh>
  );
}

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(102,217,255,0.18),transparent_35%),linear-gradient(180deg,#050816,#091127)]" />
      <div className="relative flex flex-col items-center gap-6">
        <div className="h-52 w-52">
          <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 2, 3]} intensity={1.5} color="#66d9ff" />
            <Spinner />
          </Canvas>
        </div>
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-white/50">Initializing enterprise suite</p>
          <div className="h-1.5 w-72 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-aqua animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}