import React, { useRef, useEffect } from "react";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import RealisticHumanTeacher from "./RealisticHumanTeacher";
import TeacherCharacter from "./TeacherCharacter";
import CustomModelLoader from "./CustomModelLoader";

export default function StudioScene({
  modelType = "realistic", // 'realistic', 'procedural', 'custom'
  wireframe,
  expression,
  smileIntensity,
  speechOpen,
  isSpeaking = false,
  focusPosition = "visual",
  eyeBlink,
  headTilt,
  idleAnimation,
  isWalking = true,
  walkSpeed = 1.0,
  turntable,
  turntableSpeed,
  cameraPreset,
  customModelFile,
  customModelUrl,
  lightingPreset,
  floorStyle = "dark", // 'dark' | 'light' | 'invisible'
}) {
  const controlsRef = useRef();
  const turntableGroupRef = useRef();
  const { camera } = useThree();

  // Handle camera presets
  useEffect(() => {
    if (!controlsRef.current) return;

    const targetPos = new THREE.Vector3();
    const lookAtPos = new THREE.Vector3(0, 0, 0);

    switch (cameraPreset) {
      case "0": // Front (Ön)
        targetPos.set(0, 0.05, 2.7);
        lookAtPos.set(0, 0, 0);
        break;
      case "45":
        targetPos.set(1.9, 0.05, 1.9);
        lookAtPos.set(0, 0, 0);
        break;
      case "90": // Right (Sağ)
        targetPos.set(2.7, 0.05, 0);
        lookAtPos.set(0, 0, 0);
        break;
      case "135":
        targetPos.set(1.9, 0.05, -1.9);
        lookAtPos.set(0, 0, 0);
        break;
      case "180": // Back (Arxa)
        targetPos.set(0, 0.05, -2.7);
        lookAtPos.set(0, 0, 0);
        break;
      case "225":
        targetPos.set(-1.9, 0.05, -1.9);
        lookAtPos.set(0, 0, 0);
        break;
      case "270": // Left (Sol)
        targetPos.set(-2.7, 0.05, 0);
        lookAtPos.set(0, 0, 0);
        break;
      case "315":
        targetPos.set(-1.9, 0.05, 1.9);
        lookAtPos.set(0, 0, 0);
        break;
      case "face": // Close-up face
        targetPos.set(0, 0.65, 1.2);
        lookAtPos.set(0, 0.65, 0);
        break;
      case "full": // Full body view of walking stage
      default:
        targetPos.set(0, 0.6, 3.6);
        lookAtPos.set(0, 0, 0);
        break;
    }

    camera.position.copy(targetPos);
    controlsRef.current.target.copy(lookAtPos);
    controlsRef.current.update();
  }, [cameraPreset, camera]);

  // Turntable animation
  useFrame((_, delta) => {
    if (turntable && turntableGroupRef.current) {
      turntableGroupRef.current.rotation.y += delta * turntableSpeed;
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={0.4}
        maxDistance={6}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.52}
        dampingFactor={0.06}
      />

      {/* Realistic Studio Lighting */}
      <ambientLight intensity={0.8} />

      {/* Soft warm key light */}
      <directionalLight
        position={[2, 3.5, 3]}
        intensity={1.4}
        color="#fff9f3"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Soft cool fill light */}
      <directionalLight
        position={[-2.5, 2, 2.5]}
        intensity={0.7}
        color="#e8f2ff"
      />

      {/* Hair & shoulder rim backlight (creates depth and realistic silhouette) */}
      <directionalLight
        position={[0, 3, -2.5]}
        intensity={1.2}
        color="#fff7ed"
      />

      {/* Low bounce light */}
      <directionalLight
        position={[0, -2, 1.5]}
        intensity={0.3}
        color="#eae4dc"
      />

      {/* 360 Turntable & Character */}
      <group ref={turntableGroupRef}>
        {customModelFile || customModelUrl ? (
          <CustomModelLoader
            file={customModelFile}
            url={customModelUrl}
            wireframe={wireframe}
          />
        ) : modelType === "procedural" ? (
          <TeacherCharacter
            wireframe={wireframe}
            expression={expression}
            smileIntensity={smileIntensity}
            speechOpen={speechOpen}
            eyeBlink={eyeBlink}
            headTilt={headTilt}
            idleAnimation={idleAnimation}
          />
        ) : (
          <RealisticHumanTeacher
            wireframe={wireframe}
            expression={expression}
            smileIntensity={smileIntensity}
            speechOpen={speechOpen}
            isSpeaking={isSpeaking}
            focusPosition={focusPosition}
            headTilt={headTilt}
            idleAnimation={idleAnimation}
            isWalking={isWalking}
            walkSpeed={walkSpeed}
          />
        )}

        {/* Studio Stage Floor for walking */}
        {floorStyle !== "invisible" && (
          <mesh position={[0, -0.85, 0]} receiveShadow>
            <cylinderGeometry args={[2.5, 2.6, 0.04, 64]} />
            <meshStandardMaterial
              color={floorStyle === "light" ? "#e2dfd7" : "#202328"}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        )}

        {/* Outer Ring with subtle glow */}
        {floorStyle !== "invisible" && (
          <mesh position={[0, -0.845, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.35, 2.4, 64]} />
            <meshBasicMaterial
              color={floorStyle === "light" ? "#ea580c" : "#3b82f6"}
              transparent
              opacity={0.35}
            />
          </mesh>
        )}
      </group>

      {/* Soft Contact Shadow covering the whole walking area */}
      <ContactShadows
        position={[0, -0.865, 0]}
        opacity={0.65}
        scale={7}
        blur={1.8}
        far={2.5}
      />
    </>
  );
}
