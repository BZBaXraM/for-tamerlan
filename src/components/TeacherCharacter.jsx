import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  createSuitTexture,
  createTrouserTexture,
  createWatchDialTexture,
} from "../utils/textures";

export default function TeacherCharacter({
  wireframe = false,
  expression = "smile", // 'smile', 'talk', 'surprise', 'think', 'joy', 'serious'
  smileIntensity = 0.8,
  speechOpen = 0.0,
  eyeBlink = 0.0,
  headTilt = 0.0,
  idleAnimation = true,
}) {
  const groupRef = useRef();
  const headRef = useRef();
  const chestRef = useRef();
  const jawRef = useRef();
  const mouthLeftRef = useRef();
  const mouthRightRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const leftBrowRef = useRef();
  const rightBrowRef = useRef();

  // Textures
  const suitTex = useMemo(() => createSuitTexture(), []);
  const trouserTex = useMemo(() => createTrouserTexture(), []);
  const watchDialTex = useMemo(() => createWatchDialTexture(), []);

  // Materials
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({
        color: "#e4b69d",
        roughness: 0.52,
        metalness: 0.02,
        wireframe,
      }),
      suit: new THREE.MeshStandardMaterial({
        map: suitTex,
        color: "#bda183",
        roughness: 0.85,
        metalness: 0.05,
        wireframe,
      }),
      suitDark: new THREE.MeshStandardMaterial({
        color: "#987d64",
        roughness: 0.8,
        wireframe,
      }),
      shirt: new THREE.MeshStandardMaterial({
        color: "#faf7f2",
        roughness: 0.65,
        wireframe,
      }),
      trouser: new THREE.MeshStandardMaterial({
        map: trouserTex,
        color: "#26282d",
        roughness: 0.8,
        metalness: 0.05,
        wireframe,
      }),
      shoes: new THREE.MeshStandardMaterial({
        color: "#151517",
        roughness: 0.28,
        metalness: 0.25,
        wireframe,
      }),
      hair: new THREE.MeshStandardMaterial({
        color: "#2b1b16",
        roughness: 0.5,
        metalness: 0.08,
        wireframe,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: "#d4af37",
        roughness: 0.2,
        metalness: 0.88,
        wireframe,
      }),
      leather: new THREE.MeshStandardMaterial({
        color: "#533621",
        roughness: 0.65,
        metalness: 0.05,
        wireframe,
      }),
      watchDial: new THREE.MeshStandardMaterial({
        map: watchDialTex,
        roughness: 0.15,
        wireframe,
      }),
      lips: new THREE.MeshStandardMaterial({
        color: "#ba6065",
        roughness: 0.42,
        wireframe,
      }),
      eyes: new THREE.MeshStandardMaterial({
        color: "#f0f0f0",
        roughness: 0.1,
        wireframe,
      }),
      iris: new THREE.MeshStandardMaterial({
        color: "#463022",
        roughness: 0.2,
        wireframe,
      }),
      pupil: new THREE.MeshBasicMaterial({
        color: "#080808",
      }),
      teeth: new THREE.MeshStandardMaterial({
        color: "#fafafa",
        roughness: 0.2,
        wireframe,
      }),
    };
  }, [wireframe, suitTex, trouserTex, watchDialTex]);

  // Animation Loop for breathing, talking, and expressions
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Breathing (chest & posture)
    if (idleAnimation && chestRef.current) {
      const breath = Math.sin(time * 1.8) * 0.008;
      chestRef.current.scale.set(
        1 + breath,
        1 + breath * 0.5,
        1 + breath * 1.5,
      );
      chestRef.current.position.y = 1.18 + breath * 0.2;
    }

    // Facial Mimics / Blendshapes
    let targetSmile = 0.3;
    let targetJawOpen = 0.0;
    let targetBrowRaise = 0.0;
    let targetTilt = 0.0;

    if (expression === "smile") {
      targetSmile = 0.85;
      targetJawOpen = 0.05;
      targetBrowRaise = 0.02;
    } else if (expression === "talk") {
      targetSmile = 0.4;
      // Dynamic talking lip-sync
      targetJawOpen =
        0.12 + Math.abs(Math.sin(time * 8)) * 0.18 + speechOpen * 0.3;
    } else if (expression === "surprise") {
      targetSmile = 0.1;
      targetJawOpen = 0.28;
      targetBrowRaise = 0.12;
    } else if (expression === "think") {
      targetSmile = 0.25;
      targetJawOpen = 0.02;
      targetBrowRaise = -0.02;
      targetTilt = 0.12;
    } else if (expression === "joy") {
      targetSmile = 1.0;
      targetJawOpen = 0.14;
      targetBrowRaise = 0.05;
    } else if (expression === "serious") {
      targetSmile = 0.05;
      targetJawOpen = 0.0;
      targetBrowRaise = -0.04;
    }

    // Override with sliders if provided
    if (smileIntensity !== undefined) {
      targetSmile = Math.max(targetSmile, smileIntensity);
    }

    // Smooth lerping of facial features
    if (mouthLeftRef.current && mouthRightRef.current) {
      mouthLeftRef.current.position.y = THREE.MathUtils.lerp(
        mouthLeftRef.current.position.y,
        -0.038 + targetSmile * 0.015,
        delta * 10,
      );
      mouthRightRef.current.position.y = THREE.MathUtils.lerp(
        mouthRightRef.current.position.y,
        -0.038 + targetSmile * 0.015,
        delta * 10,
      );
    }

    if (jawRef.current) {
      jawRef.current.position.y = THREE.MathUtils.lerp(
        jawRef.current.position.y,
        -0.052 - targetJawOpen * 0.04,
        delta * 12,
      );
    }

    if (leftBrowRef.current && rightBrowRef.current) {
      leftBrowRef.current.position.y = THREE.MathUtils.lerp(
        leftBrowRef.current.position.y,
        0.045 + targetBrowRaise * 0.02,
        delta * 10,
      );
      rightBrowRef.current.position.y = THREE.MathUtils.lerp(
        rightBrowRef.current.position.y,
        0.045 + targetBrowRaise * 0.02,
        delta * 10,
      );
    }

    if (headRef.current) {
      const subtleHeadBob = idleAnimation ? Math.sin(time * 0.9) * 0.015 : 0;
      headRef.current.rotation.z = THREE.MathUtils.lerp(
        headRef.current.rotation.z,
        targetTilt + headTilt,
        delta * 6,
      );
      headRef.current.rotation.x = subtleHeadBob;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.84, 0]}>
      {/* ===================== FEET & HEELS ===================== */}
      {/* Left Shoe */}
      <group position={[-0.08, 0.035, 0.02]}>
        {/* Sole & Toe Box */}
        <mesh position={[0, -0.01, 0.04]} material={materials.shoes}>
          <boxGeometry args={[0.08, 0.035, 0.22]} />
        </mesh>
        {/* Curved front toe cap */}
        <mesh position={[0, -0.012, 0.14]} material={materials.shoes}>
          <sphereGeometry
            args={[0.038, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]}
          />
        </mesh>
        {/* Heel (45mm height) */}
        <mesh position={[0, -0.01, -0.05]} material={materials.shoes}>
          <cylinderGeometry args={[0.018, 0.014, 0.045, 16]} />
        </mesh>
      </group>

      {/* Right Shoe */}
      <group position={[0.08, 0.035, 0.02]}>
        <mesh position={[0, -0.01, 0.04]} material={materials.shoes}>
          <boxGeometry args={[0.08, 0.035, 0.22]} />
        </mesh>
        <mesh position={[0, -0.012, 0.14]} material={materials.shoes}>
          <sphereGeometry
            args={[0.038, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]}
          />
        </mesh>
        <mesh position={[0, -0.01, -0.05]} material={materials.shoes}>
          <cylinderGeometry args={[0.018, 0.014, 0.045, 16]} />
        </mesh>
      </group>

      {/* ===================== LEGS & TROUSERS ===================== */}
      {/* Left Trouser Leg */}
      <group position={[-0.08, 0.44, 0]}>
        <mesh material={materials.trouser}>
          <cylinderGeometry args={[0.085, 0.075, 0.78, 24]} />
        </mesh>
        {/* Trouser front center crease line */}
        <mesh position={[0, 0, 0.078]} material={materials.trouser}>
          <boxGeometry args={[0.004, 0.76, 0.006]} />
        </mesh>
      </group>

      {/* Right Trouser Leg */}
      <group position={[0.08, 0.44, 0]}>
        <mesh material={materials.trouser}>
          <cylinderGeometry args={[0.085, 0.075, 0.78, 24]} />
        </mesh>
        {/* Trouser front center crease line */}
        <mesh position={[0, 0, 0.078]} material={materials.trouser}>
          <boxGeometry args={[0.004, 0.76, 0.006]} />
        </mesh>
      </group>

      {/* Trouser Pelvis / Waistband */}
      <mesh position={[0, 0.84, 0]} material={materials.trouser}>
        <cylinderGeometry args={[0.165, 0.18, 0.14, 24]} />
      </mesh>

      {/* ===================== TORSO & SUIT ===================== */}
      <group ref={chestRef} position={[0, 1.18, 0]}>
        {/* Inner White Blouse */}
        <mesh position={[0, 0.03, 0.01]} material={materials.shirt}>
          <cylinderGeometry args={[0.155, 0.145, 0.44, 24]} />
        </mesh>
        {/* Blouse vertical button placket */}
        <mesh position={[0, 0.04, 0.146]} material={materials.shirt}>
          <boxGeometry args={[0.024, 0.36, 0.01]} />
        </mesh>
        {/* Shirt pearl buttons */}
        {[0.16, 0.1, 0.04, -0.02, -0.08].map((y, i) => (
          <mesh
            key={`btn-${i}`}
            position={[0, y, 0.154]}
            material={materials.shirt}
          >
            <cylinderGeometry
              args={[0.0045, 0.0045, 0.004, 12]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </mesh>
        ))}
        {/* Blouse open V-collar points */}
        <mesh
          position={[-0.045, 0.22, 0.12]}
          rotation={[0.2, 0.3, -0.4]}
          material={materials.shirt}
        >
          <boxGeometry args={[0.055, 0.08, 0.008]} />
        </mesh>
        <mesh
          position={[0.045, 0.22, 0.12]}
          rotation={[0.2, -0.3, 0.4]}
          material={materials.shirt}
        >
          <boxGeometry args={[0.055, 0.08, 0.008]} />
        </mesh>

        {/* --- BEIGE BLAZER JACKET --- */}
        {/* Main Blazer Body */}
        <mesh position={[0, -0.01, 0]} material={materials.suit}>
          <cylinderGeometry args={[0.18, 0.19, 0.48, 24]} />
        </mesh>

        {/* Left Lapel */}
        <group position={[-0.085, 0.12, 0.14]} rotation={[0.15, 0.35, -0.15]}>
          <mesh material={materials.suit}>
            <boxGeometry args={[0.07, 0.28, 0.015]} />
          </mesh>
        </group>

        {/* Right Lapel */}
        <group position={[0.085, 0.12, 0.14]} rotation={[0.15, -0.35, 0.15]}>
          <mesh material={materials.suit}>
            <boxGeometry args={[0.07, 0.28, 0.015]} />
          </mesh>
        </group>

        {/* Blazer Lapel Notch / Collar Upper */}
        <mesh
          position={[0, 0.22, 0.08]}
          rotation={[0.3, 0, 0]}
          material={materials.suit}
        >
          <cylinderGeometry args={[0.12, 0.16, 0.08, 20]} />
        </mesh>

        {/* Blazer Buttons (Horn buttons) */}
        <mesh position={[0.015, -0.01, 0.178]} material={materials.suitDark}>
          <cylinderGeometry
            args={[0.009, 0.009, 0.006, 16]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </mesh>
        <mesh position={[0.015, -0.1, 0.18]} material={materials.suitDark}>
          <cylinderGeometry
            args={[0.009, 0.009, 0.006, 16]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </mesh>

        {/* Left Pocket Flap */}
        <mesh
          position={[-0.14, -0.13, 0.12]}
          rotation={[0, 0.3, -0.08]}
          material={materials.suit}
        >
          <boxGeometry args={[0.08, 0.022, 0.012]} />
        </mesh>

        {/* Right Pocket Flap */}
        <mesh
          position={[0.14, -0.13, 0.12]}
          rotation={[0, -0.3, 0.08]}
          material={materials.suit}
        >
          <boxGeometry args={[0.08, 0.022, 0.012]} />
        </mesh>

        {/* Breast Pocket Detail (Right side as viewed from front / teacher's left) */}
        <mesh
          position={[0.1, 0.08, 0.14]}
          rotation={[0, -0.3, 0.04]}
          material={materials.suitDark}
        >
          <boxGeometry args={[0.05, 0.008, 0.01]} />
        </mesh>
      </group>

      {/* ===================== ARMS & HANDS ===================== */}
      {/* Left Arm (Viewer's left) */}
      <group position={[-0.23, 1.25, 0]}>
        {/* Shoulder Pad */}
        <mesh position={[0, 0.04, 0]} material={materials.suit}>
          <sphereGeometry args={[0.07, 16, 16]} />
        </mesh>
        {/* Upper Arm Sleeve */}
        <mesh
          position={[-0.03, -0.15, 0]}
          rotation={[0, 0, 0.08]}
          material={materials.suit}
        >
          <cylinderGeometry args={[0.058, 0.05, 0.32, 20]} />
        </mesh>
        {/* Forearm Sleeve */}
        <mesh
          position={[-0.05, -0.42, 0.02]}
          rotation={[0.05, 0, 0.05]}
          material={materials.suit}
        >
          <cylinderGeometry args={[0.05, 0.045, 0.28, 20]} />
        </mesh>
        {/* White shirt cuff peeking out */}
        <mesh position={[-0.06, -0.56, 0.02]} material={materials.shirt}>
          <cylinderGeometry args={[0.044, 0.044, 0.03, 20]} />
        </mesh>
        {/* Left Wrist & Hand */}
        <group position={[-0.06, -0.62, 0.02]}>
          {/* Palm */}
          <mesh material={materials.skin}>
            <boxGeometry args={[0.045, 0.09, 0.025]} />
          </mesh>
          {/* Fingers */}
          {[-0.016, -0.005, 0.006, 0.017].map((fx, i) => (
            <mesh
              key={`lf-${i}`}
              position={[fx, -0.07, 0]}
              material={materials.skin}
            >
              <cylinderGeometry args={[0.004, 0.0035, 0.065, 8]} />
            </mesh>
          ))}
          {/* Thumb */}
          <mesh
            position={[0.025, -0.03, 0.01]}
            rotation={[0, 0, -0.4]}
            material={materials.skin}
          >
            <cylinderGeometry args={[0.0045, 0.004, 0.04, 8]} />
          </mesh>
        </group>
      </group>

      {/* Right Arm (Viewer's right - HAS THE WATCH on wrist!) */}
      <group position={[0.23, 1.25, 0]}>
        {/* Shoulder Pad */}
        <mesh position={[0, 0.04, 0]} material={materials.suit}>
          <sphereGeometry args={[0.07, 16, 16]} />
        </mesh>
        {/* Upper Arm Sleeve */}
        <mesh
          position={[0.03, -0.15, 0]}
          rotation={[0, 0, -0.08]}
          material={materials.suit}
        >
          <cylinderGeometry args={[0.058, 0.05, 0.32, 20]} />
        </mesh>
        {/* Forearm Sleeve */}
        <mesh
          position={[0.05, -0.42, 0.02]}
          rotation={[0.05, 0, -0.05]}
          material={materials.suit}
        >
          <cylinderGeometry args={[0.05, 0.045, 0.28, 20]} />
        </mesh>
        {/* White shirt cuff peeking out */}
        <mesh position={[0.06, -0.56, 0.02]} material={materials.shirt}>
          <cylinderGeometry args={[0.044, 0.044, 0.03, 20]} />
        </mesh>

        {/* --- CLASSIC GOLD WATCH (32mm dial, brown leather strap) --- */}
        <group position={[0.06, -0.585, 0.02]}>
          {/* Leather Strap */}
          <mesh material={materials.leather}>
            <cylinderGeometry args={[0.041, 0.041, 0.022, 24]} />
          </mesh>
          {/* Gold Case */}
          <mesh
            position={[0.038, 0, 0.015]}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.gold}
          >
            <cylinderGeometry args={[0.018, 0.018, 0.008, 24]} />
          </mesh>
          {/* Dial Face */}
          <mesh
            position={[0.043, 0, 0.015]}
            rotation={[0, Math.PI / 2, 0]}
            material={materials.watchDial}
          >
            <circleGeometry args={[0.015, 24]} />
          </mesh>
        </group>

        {/* Right Wrist & Hand */}
        <group position={[0.06, -0.62, 0.02]}>
          {/* Palm */}
          <mesh material={materials.skin}>
            <boxGeometry args={[0.045, 0.09, 0.025]} />
          </mesh>
          {/* Fingers */}
          {[-0.017, -0.006, 0.005, 0.016].map((fx, i) => (
            <mesh
              key={`rf-${i}`}
              position={[fx, -0.07, 0]}
              material={materials.skin}
            >
              <cylinderGeometry args={[0.004, 0.0035, 0.065, 8]} />
            </mesh>
          ))}
          {/* Thumb */}
          <mesh
            position={[-0.025, -0.03, 0.01]}
            rotation={[0, 0, 0.4]}
            material={materials.skin}
          >
            <cylinderGeometry args={[0.0045, 0.004, 0.04, 8]} />
          </mesh>
        </group>
      </group>

      {/* ===================== NECK ===================== */}
      <mesh position={[0, 1.45, 0]} material={materials.skin}>
        <cylinderGeometry args={[0.05, 0.062, 0.12, 20]} />
      </mesh>

      {/* ===================== HEAD & FACE ===================== */}
      <group ref={headRef} position={[0, 1.58, 0]}>
        {/* Head Cranium */}
        <mesh position={[0, 0.02, -0.02]} material={materials.skin}>
          <sphereGeometry args={[0.105, 32, 32]} />
        </mesh>
        {/* Face Jaw / Chin structure */}
        <mesh position={[0, -0.04, 0.015]} material={materials.skin}>
          <cylinderGeometry args={[0.09, 0.05, 0.11, 24]} />
        </mesh>
        {/* Sculpted Chin */}
        <mesh position={[0, -0.09, 0.04]} material={materials.skin}>
          <sphereGeometry args={[0.03, 16, 16]} />
        </mesh>
        {/* Cheekbones */}
        <mesh position={[-0.065, -0.01, 0.065]} material={materials.skin}>
          <sphereGeometry args={[0.035, 16, 16]} />
        </mesh>
        <mesh position={[0.065, -0.01, 0.065]} material={materials.skin}>
          <sphereGeometry args={[0.035, 16, 16]} />
        </mesh>

        {/* --- EYES --- */}
        {/* Left Eye (Viewer's left) */}
        <group ref={leftEyeRef} position={[-0.036, 0.018, 0.088]}>
          {/* White eyeball */}
          <mesh material={materials.eyes}>
            <sphereGeometry args={[0.016, 16, 16]} />
          </mesh>
          {/* Iris */}
          <mesh position={[0, 0, 0.012]} material={materials.iris}>
            <circleGeometry args={[0.008, 16]} />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, 0, 0.013]} material={materials.pupil}>
            <circleGeometry args={[0.0035, 12]} />
          </mesh>
          {/* Eyelid Upper */}
          <mesh
            position={[0, 0.01, 0.008]}
            rotation={[0.4, 0, 0]}
            material={materials.skin}
          >
            <boxGeometry args={[0.032, 0.008, 0.01]} />
          </mesh>
        </group>

        {/* Right Eye (Viewer's right) */}
        <group ref={rightEyeRef} position={[0.036, 0.018, 0.088]}>
          <mesh material={materials.eyes}>
            <sphereGeometry args={[0.016, 16, 16]} />
          </mesh>
          <mesh position={[0, 0, 0.012]} material={materials.iris}>
            <circleGeometry args={[0.008, 16]} />
          </mesh>
          <mesh position={[0, 0, 0.013]} material={materials.pupil}>
            <circleGeometry args={[0.0035, 12]} />
          </mesh>
          <mesh
            position={[0, 0.01, 0.008]}
            rotation={[0.4, 0, 0]}
            material={materials.skin}
          >
            <boxGeometry args={[0.032, 0.008, 0.01]} />
          </mesh>
        </group>

        {/* Eyebrows */}
        <mesh
          ref={leftBrowRef}
          position={[-0.038, 0.045, 0.098]}
          rotation={[0, 0, -0.08]}
          material={materials.hair}
        >
          <boxGeometry args={[0.036, 0.007, 0.006]} />
        </mesh>
        <mesh
          ref={rightBrowRef}
          position={[0.038, 0.045, 0.098]}
          rotation={[0, 0, 0.08]}
          material={materials.hair}
        >
          <boxGeometry args={[0.036, 0.007, 0.006]} />
        </mesh>

        {/* --- NOSE --- */}
        <group position={[0, -0.01, 0.102]}>
          {/* Bridge */}
          <mesh material={materials.skin}>
            <boxGeometry args={[0.018, 0.045, 0.02]} />
          </mesh>
          {/* Tip & Nostrils (36mm width) */}
          <mesh position={[0, -0.022, 0.012]} material={materials.skin}>
            <sphereGeometry args={[0.014, 16, 16]} />
          </mesh>
          <mesh position={[-0.014, -0.024, 0.004]} material={materials.skin}>
            <sphereGeometry args={[0.008, 12, 12]} />
          </mesh>
          <mesh position={[0.014, -0.024, 0.004]} material={materials.skin}>
            <sphereGeometry args={[0.008, 12, 12]} />
          </mesh>
        </group>

        {/* --- MOUTH & LIPS (54mm x 18mm) --- */}
        {/* Upper Lip */}
        <mesh position={[0, -0.046, 0.096]} material={materials.lips}>
          <boxGeometry args={[0.046, 0.009, 0.012]} />
        </mesh>
        {/* Lower Lip / Jaw */}
        <group ref={jawRef} position={[0, -0.054, 0.094]}>
          <mesh material={materials.lips}>
            <boxGeometry args={[0.042, 0.012, 0.012]} />
          </mesh>
          {/* Teeth (visible on speak / wide smile) */}
          <mesh position={[0, 0.008, -0.004]} material={materials.teeth}>
            <boxGeometry args={[0.032, 0.008, 0.006]} />
          </mesh>
        </group>
        {/* Mouth Corners for Smile blendshape */}
        <mesh
          ref={mouthLeftRef}
          position={[-0.025, -0.046, 0.092]}
          material={materials.lips}
        >
          <sphereGeometry args={[0.007, 12, 12]} />
        </mesh>
        <mesh
          ref={mouthRightRef}
          position={[0.025, -0.046, 0.092]}
          material={materials.lips}
        >
          <sphereGeometry args={[0.007, 12, 12]} />
        </mesh>

        {/* --- EARS & GOLD HOOP EARRINGS --- */}
        {/* Left Ear */}
        <group position={[-0.102, 0.01, -0.01]}>
          <mesh rotation={[0, 0.2, 0]} material={materials.skin}>
            <boxGeometry args={[0.015, 0.055, 0.03]} />
          </mesh>
          {/* Gold Hoop Earring */}
          <mesh position={[0, -0.032, 0.002]} material={materials.gold}>
            <torusGeometry args={[0.012, 0.0025, 12, 24]} />
          </mesh>
        </group>
        {/* Right Ear */}
        <group position={[0.102, 0.01, -0.01]}>
          <mesh rotation={[0, -0.2, 0]} material={materials.skin}>
            <boxGeometry args={[0.015, 0.055, 0.03]} />
          </mesh>
          {/* Gold Hoop Earring */}
          <mesh position={[0, -0.032, 0.002]} material={materials.gold}>
            <torusGeometry args={[0.012, 0.0025, 12, 24]} />
          </mesh>
        </group>

        {/* --- HAIR (Brown, center parted, elegant updo / low chignon bun) --- */}
        {/* Top & Crown */}
        <mesh position={[0, 0.075, -0.015]} material={materials.hair}>
          <sphereGeometry
            args={[0.115, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.65]}
          />
        </mesh>
        {/* Left Hair Volume */}
        <mesh position={[-0.08, 0.04, -0.01]} material={materials.hair}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        {/* Right Hair Volume */}
        <mesh position={[0.08, 0.04, -0.01]} material={materials.hair}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        {/* Soft front hair strands framing face */}
        <mesh
          position={[-0.085, 0.01, 0.05]}
          rotation={[0.2, 0.1, -0.2]}
          material={materials.hair}
        >
          <cylinderGeometry args={[0.012, 0.005, 0.14, 12]} />
        </mesh>
        <mesh
          position={[0.085, 0.01, 0.05]}
          rotation={[0.2, -0.1, 0.2]}
          material={materials.hair}
        >
          <cylinderGeometry args={[0.012, 0.005, 0.14, 12]} />
        </mesh>
        {/* Low Bun / Chignon at the back of head */}
        <group position={[0, 0.01, -0.12]}>
          {/* Bun core */}
          <mesh material={materials.hair}>
            <sphereGeometry args={[0.065, 20, 20]} />
          </mesh>
          {/* Bun twist ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.hair}>
            <torusGeometry args={[0.05, 0.018, 16, 24]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
