import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import RealisticHumanTeacher from "./RealisticHumanTeacher";

export default function Classroom3DScene({
  gesture = "rest",
  lookAt = "student",
  expression = "smile",
  isSpeaking = false,
  idleAnimation = true,
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.15, 2.3], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.85} />

      {/* Key Light */}
      <directionalLight
        position={[2, 3, 2.5]}
        intensity={1.3}
        color="#fffaf4"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Fill Light */}
      <directionalLight
        position={[-2.5, 2, 2]}
        intensity={0.65}
        color="#ebf4ff"
      />

      {/* Rim / Hair Backlight */}
      <directionalLight
        position={[0, 2.8, -2.2]}
        intensity={1.1}
        color="#fff4e6"
      />

      {/* Teacher positioned comfortably */}
      <group position={[0, -0.05, 0]}>
        <RealisticHumanTeacher
          gesture={gesture}
          lookAt={lookAt}
          boardSide="left"
          expression={isSpeaking ? "talk" : expression}
          speechOpen={isSpeaking ? 0.35 : 0.0}
          smileIntensity={0.7}
          idleAnimation={idleAnimation}
        />

        {/* Minimalist Classroom circular floor stand */}
        <mesh position={[0, -0.85, 0]} receiveShadow>
          <cylinderGeometry args={[0.7, 0.75, 0.03, 48]} />
          <meshStandardMaterial
            color="#1e2126"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      </group>

      <ContactShadows
        position={[0, -0.865, 0]}
        opacity={0.6}
        scale={3}
        blur={1.8}
        far={2}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.2}
        maxDistance={3.8}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.52}
        dampingFactor={0.06}
      />
    </Canvas>
  );
}
