import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

function RotatingMoon() {
  const mesh = useRef<Mesh>();
  useFrame((state, delta) => {
    if (mesh.current) mesh.current.rotation.y += 0.2 * delta;
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshStandardMaterial color={'#f5f3ea'} metalness={0.2} roughness={0.6} />
    </mesh>
  );
}

export default function MoonScene({ className = '' }: { className?: string }) {
  return (
    <div className={`h-64 w-full sm:h-96 sm:w-96 ${className}`}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <RotatingMoon />
      </Canvas>
    </div>
  );
}
