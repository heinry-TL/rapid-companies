"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";

// AnimatedSphere component that will be rendered in the Canvas
function AnimatedSphere() {
  // Create a reference to the mesh
  const meshRef = useRef<THREE.Mesh>(null);
  // Create a reference to the material
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null);

  // Use the useFrame hook to animate the sphere
  useFrame((state) => {
    if (meshRef.current) {
      // Rotate the sphere
      meshRef.current.rotation.x = meshRef.current.rotation.y += 0.01;
    }

    if (materialRef.current) {
      // Animate the distortion
      materialRef.current.distort = THREE.MathUtils.lerp(
        materialRef.current.distort,
        Math.sin(state.clock.getElapsedTime() * 0.3) * 0.3 + 0.5,
        0.05
      );
    }
  });

  // Return the sphere with distortion material
  return (
    <Sphere args={[1, 100, 100]} scale={2.5}>
      <MeshDistortMaterial
        ref={materialRef}
        color="#4B9CD3"
        attach="material"
        distort={0.5}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

// Main HeroAnimation component
export default function HeroAnimation() {
  // Create a reference to the container
  const containerRef = useRef<HTMLDivElement>(null);

  // Use useEffect to animate the container with GSAP
  useEffect(() => {
    if (containerRef.current) {
      // Animate the container
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: "power3.out",
        }
      );
    }
  }, []);

  // Return the container with the Canvas
  return (
    <div ref={containerRef} className="w-full h-[400px] md:h-[500px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight
          position={[-10, -10, -5]}
          intensity={0.5}
          color="#8352FD"
        />
        <AnimatedSphere />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}
