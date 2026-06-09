import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { useRef } from "react";

function Building() {
  const building = useRef();

  useFrame((state) => {
    if (building.current) {
      building.current.rotation.y = state.clock.elapsedTime * 0.18;
    }
  });

  return (
    <group ref={building}>
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[2.2, 2.8, 1.2]} />
        <meshStandardMaterial color="#0f1833" metalness={0.4} roughness={0.2} />
      </mesh>
      <mesh position={[-0.72, 1.3, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.8]} />
        <meshStandardMaterial color="#14244b" emissive="#2d6cff" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.72, 1.3, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.8]} />
        <meshStandardMaterial color="#1d1744" emissive="#8f5eff" emissiveIntensity={0.24} />
      </mesh>
      {Array.from({ length: 12 }).map((_, index) => (
        <mesh key={index} position={[-0.72 + (index % 3) * 0.6, -0.8 + Math.floor(index / 3) * 0.6, 0.61]}>
          <boxGeometry args={[0.24, 0.24, 0.02]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#66d9ff" : "#9d7dff"} emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Avatar({ position, color }) {
  return (
    <Float speed={2.4} rotationIntensity={0.4} floatIntensity={1.3}>
      <mesh position={position}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[position[0], position[1] - 0.28, position[2]]}>
        <capsuleGeometry args={[0.1, 0.28, 8, 16]} />
        <meshStandardMaterial color="#d7e7ff" opacity={0.9} transparent />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <div className="relative h-[440px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-glow backdrop-blur-xl md:h-[560px]">
      <Canvas camera={{ position: [0, 1.2, 5.5], fov: 45 }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 5, 3]} intensity={1.8} color="#7dd3fc" />
        <directionalLight position={[-4, -2, 2]} intensity={1} color="#a855f7" />
        <Stars radius={42} depth={18} count={1800} factor={3} saturation={0} fade speed={1} />
        <Building />
        <Avatar position={[-1.95, 0.45, 0.8]} color="#66d9ff" />
        <Avatar position={[1.95, 0.1, 0.9]} color="#9d7dff" />
        <Avatar position={[0.15, 1.75, -0.2]} color="#3cf2d8" />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,22,0.2)_72%,rgba(5,8,22,0.72)_100%)]" />
    </div>
  );
}