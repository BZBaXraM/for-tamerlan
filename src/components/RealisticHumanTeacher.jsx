import React, { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import * as THREE from "three";

export default function RealisticHumanTeacher({
  wireframe = false,
  expression = "smile",
  smileIntensity = 0.85,
  speechOpen = 0.0,
  isSpeaking = false,
  idleAnimation = true,
  isWalking = true,
  walkSpeed = 1.0,
  headTilt = 0.0,
  gesture = "rest", // 'rest' | 'point-board' | 'explain' | 'point-ring'
  lookAt = "student", // 'student' | 'board' | 'ring'
  boardSide = "left", // board is to teacher's right/left
  focusPosition = "visual", // 'visual' | 'text' | 'ring'
}) {
  const [model, setModel] = useState(null);
  const bonesMap = useRef({});
  const initialBoneRotations = useRef({});
  const initialBonePositions = useRef({});
  const groupRef = useRef();
  const walkCycle = useRef(0);
  const walkTime = useRef(0);
  // greeting wave: plays once after model loads
  const waveStarted = useRef(false);
  const mountTime = useRef(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      "/models/teacher_female.glb",
      (gltf) => {
        const scene = gltf.scene;

        // Map and store bones
        const bMap = {};
        const bRot = {};
        const bPos = {};

        scene.traverse((child) => {
          if (child.isBone) {
            bMap[child.name] = child;
            bRot[child.name] = child.rotation.clone();
            bPos[child.name] = child.position.clone();
          }

          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Enhance materials for realism
            if (child.material) {
              child.material.wireframe = wireframe;

              // If it's body or clothes, fine-tune roughness and shading
              if (child.material.name === "f020_head") {
                child.material.roughness = 0.48;
                child.material.metalness = 0.0;
                // Slight warm healthy skin tint
                if (child.material.color) {
                  child.material.color.setRGB(1.05, 0.98, 0.96);
                }
              }

              if (child.material.name === "f020_body") {
                child.material.roughness = 0.75;
                child.material.metalness = 0.05;
                // Ensure modest blouse texture is applied directly
                const texLoader = new THREE.TextureLoader();
                texLoader.load("/models/tex_0.webp", (tex) => {
                  tex.flipY = false;
                  tex.colorSpace = THREE.SRGBColorSpace;
                  child.material.map = tex;
                  child.material.needsUpdate = true;
                });
              }

              if (child.material.name === "f020_opacity") {
                child.material.transparent = true;
                child.material.depthWrite = true;
                child.material.alphaTest = 0.5;
              }
            }
          }
        });

        bonesMap.current = bMap;
        initialBoneRotations.current = bRot;
        initialBonePositions.current = bPos;

        // Add subtle stylish teacher accessories to the real human model
        // 1. Golden hoop earrings
        const headBone = bMap["Head"];
        if (headBone) {
          const goldMat = new THREE.MeshStandardMaterial({
            color: "#d4af37",
            metalness: 0.85,
            roughness: 0.2,
          });
          const earringGeo = new THREE.TorusGeometry(0.014, 0.0028, 16, 24);

          const leftEarring = new THREE.Mesh(earringGeo, goldMat);
          leftEarring.position.set(-0.082, 0.04, 0.01);
          leftEarring.rotation.y = Math.PI / 2;
          headBone.add(leftEarring);

          const rightEarring = new THREE.Mesh(earringGeo, goldMat);
          rightEarring.position.set(0.082, 0.04, 0.01);
          rightEarring.rotation.y = Math.PI / 2;
          headBone.add(rightEarring);

          // 2. Elegant low chignon hair bun at the back
          const hairMat = new THREE.MeshStandardMaterial({
            color: "#281a15",
            roughness: 0.55,
            metalness: 0.1,
          });
          const bunCore = new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 20, 20),
            hairMat,
          );
          bunCore.position.set(0, 0.02, -0.11);
          headBone.add(bunCore);

          const bunTwist = new THREE.Mesh(
            new THREE.TorusGeometry(0.045, 0.015, 16, 24),
            hairMat,
          );
          bunTwist.position.set(0, 0.02, -0.11);
          bunTwist.rotation.x = Math.PI / 2;
          headBone.add(bunTwist);
        }

        // 3. Gold Watch with brown leather strap on left wrist
        const leftHandBone = bMap["Bip01_L_Hand"];
        if (leftHandBone) {
          const watchGroup = new THREE.Group();

          const strapMat = new THREE.MeshStandardMaterial({
            color: "#4a2d18",
            roughness: 0.6,
          });
          const strap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.038, 0.038, 0.02, 24),
            strapMat,
          );
          watchGroup.add(strap);

          const goldMat = new THREE.MeshStandardMaterial({
            color: "#d4af37",
            metalness: 0.9,
            roughness: 0.2,
          });
          const caseMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.016, 0.016, 0.006, 24),
            goldMat,
          );
          caseMesh.rotation.z = Math.PI / 2;
          caseMesh.position.set(0.036, 0, 0);
          watchGroup.add(caseMesh);

          const dialMat = new THREE.MeshBasicMaterial({ color: "#f8f8f5" });
          const dial = new THREE.Mesh(
            new THREE.CircleGeometry(0.013, 20),
            dialMat,
          );
          dial.rotation.y = Math.PI / 2;
          dial.position.set(0.04, 0, 0);
          watchGroup.add(dial);

          watchGroup.position.set(0, 0.02, 0);
          leftHandBone.add(watchGroup);
        }

        // Adjust model scale and ground position
        scene.scale.setScalar(0.97);
        scene.position.set(0, -0.84, 0);

        // Record clock offset so we can play greeting wave on mount
        waveStarted.current = false;
        mountTime.current = null; // will be set on first useFrame after model ready

        setModel(scene);
      },
      undefined,
      (err) => {
        console.error("Failed to load realistic teacher model:", err);
      },
    );
  }, [wireframe]);

  // Real-time organic animation of facial bones & breathing
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const bMap = bonesMap.current;
    const bRot = initialBoneRotations.current;
    const bPos = initialBonePositions.current;

    if (!bMap["Head"]) return;

    // ── Record model mount time (first frame after model loads) ──────
    if (mountTime.current === null) mountTime.current = time;
    const timeSinceMount = time - mountTime.current;

    // ── GREETING WAVE (first 2.2 seconds after model appears) ───────
    // Right arm raises and waves 2× then returns to side — classic
    // friendly presenter welcome gesture.
    const WAVE_DURATION = 2.2;
    const isWaving = timeSinceMount < WAVE_DURATION;

    // ── FRIENDLY IDLE EXPRESSIONS ────────────────────────────────────
    // Small periodic head tilts make the character feel alive and warm.
    // Pattern: gentle tilt every ~6s, brief eyebrow raise every ~8s.
    const idlePeriod6  = (time * (1 / 6))  % 1;   // 0→1 every 6 sec
    const idlePeriod8  = (time * (1 / 8))  % 1;   // 0→1 every 8 sec
    const idlePeriod11 = (time * (1 / 11)) % 1;   // 0→1 every 11 sec

    // Curious head tilt: lean ~6° when idle period crosses 0.3→0.5
    const curiousTilt = idlePeriod6 > 0.3 && idlePeriod6 < 0.6
      ? Math.sin((idlePeriod6 - 0.3) / 0.3 * Math.PI) * 0.1
      : 0;

    // Friendly eyebrow micro-raise every 8 sec
    const browRaise = idlePeriod8 > 0.1 && idlePeriod8 < 0.25
      ? Math.sin((idlePeriod8 - 0.1) / 0.15 * Math.PI) * 0.012
      : 0;

    // Slow approving nod every 11 sec
    const approveNod = idlePeriod11 > 0.2 && idlePeriod11 < 0.45
      ? Math.sin((idlePeriod11 - 0.2) / 0.25 * Math.PI) * 0.06
      : 0;
    // 1. Breathing + friendly idle micro-movements
    if (idleAnimation) {
      const breath = Math.sin(time * 1.6) * 0.015;
      const spine1 = bMap["Bip01_Spine1"];
      const spine2b = bMap["Bip01_Spine2"];
      const neck = bMap["Bip01_Neck"];

      if (spine1 && bRot["Bip01_Spine1"]) {
        spine1.rotation.x = bRot["Bip01_Spine1"].x + breath * 0.4;
      }
      if (spine2b && bRot["Bip01_Spine2"]) {
        spine2b.rotation.x = bRot["Bip01_Spine2"].x + breath * 0.6;
      }
      if (neck && bRot["Bip01_Neck"]) {
        neck.rotation.x = bRot["Bip01_Neck"].x - breath * 0.2 + approveNod;
        neck.rotation.z = THREE.MathUtils.lerp(
          neck.rotation.z,
          bRot["Bip01_Neck"].z + curiousTilt * 0.5 + Math.sin(time * 0.8) * 0.006,
          delta * 2.5
        );
      }
    }

    // 2. Realistic Facial Bone Expressions: Radiant, welcoming teacher smile for clients
    let smileVal = 0.94;
    let jawOpenVal = 0.04;
    let browVal = 0.05;
    let cheekVal = 0.06;

    // Lip-sync / speech jaw animation
    if (isSpeaking) {
      const speechSync =
        (Math.sin(time * 14) * 0.5 + 0.5) * (Math.sin(time * 7) * 0.4 + 0.6);
      jawOpenVal = 0.08 + speechSync * 0.38;
    } else if (speechOpen > 0) {
      jawOpenVal = 0.04 + speechOpen * 0.4;
    }

    if (smileIntensity !== undefined) {
      smileVal = Math.max(smileVal, smileIntensity);
    }

    // Drive Mouth Corners (Radiant, genuine smile)
    const lMouthCorner = bMap["Bip01_LMouthCorner"];
    const rMouthCorner = bMap["Bip01_RMouthCorner"];
    const mUpperLip = bMap["Bip01_MUpperLip"];
    const mBottomLip = bMap["Bip01_MBottomLip"];

    if (lMouthCorner && bPos["Bip01_LMouthCorner"]) {
      lMouthCorner.position.y = THREE.MathUtils.lerp(
        lMouthCorner.position.y,
        bPos["Bip01_LMouthCorner"].y + smileVal * 0.009,
        delta * 10,
      );
      lMouthCorner.position.x = THREE.MathUtils.lerp(
        lMouthCorner.position.x,
        bPos["Bip01_LMouthCorner"].x - smileVal * 0.005,
        delta * 10,
      );
    }
    if (rMouthCorner && bPos["Bip01_RMouthCorner"]) {
      rMouthCorner.position.y = THREE.MathUtils.lerp(
        rMouthCorner.position.y,
        bPos["Bip01_RMouthCorner"].y + smileVal * 0.009,
        delta * 10,
      );
      rMouthCorner.position.x = THREE.MathUtils.lerp(
        rMouthCorner.position.x,
        bPos["Bip01_RMouthCorner"].x + smileVal * 0.005,
        delta * 10,
      );
    }
    if (mUpperLip && bPos["Bip01_MUpperLip"]) {
      mUpperLip.position.y = THREE.MathUtils.lerp(
        mUpperLip.position.y,
        bPos["Bip01_MUpperLip"].y + smileVal * 0.002,
        delta * 10,
      );
    }

    // Drive Cheeks (Apple of cheek lifts on smile)
    const lCheek = bMap["Bip01_LCheek"];
    const rCheek = bMap["Bip01_RCheek"];
    if (lCheek && bPos["Bip01_LCheek"]) {
      lCheek.position.y = THREE.MathUtils.lerp(
        lCheek.position.y,
        bPos["Bip01_LCheek"].y + (smileVal * 0.006 + cheekVal * 0.004),
        delta * 10,
      );
    }
    if (rCheek && bPos["Bip01_RCheek"]) {
      rCheek.position.y = THREE.MathUtils.lerp(
        rCheek.position.y,
        bPos["Bip01_RCheek"].y + (smileVal * 0.006 + cheekVal * 0.004),
        delta * 10,
      );
    }

    // Drive Jaw (Speech / Surprise)
    const jaw = bMap["Bip01_MJaw"];
    if (jaw && bRot["Bip01_MJaw"]) {
      jaw.rotation.x = THREE.MathUtils.lerp(
        jaw.rotation.x,
        bRot["Bip01_MJaw"].x - jawOpenVal * 0.35,
        delta * 12,
      );
    }

    // Drive Eyebrows — base raise + periodic friendly lift
    const lBrow = bMap["Bip01_LInnerEyebrow"];
    const rBrow = bMap["Bip01_RInnerEyebrow"];
    if (lBrow && bPos["Bip01_LInnerEyebrow"]) {
      lBrow.position.y = THREE.MathUtils.lerp(
        lBrow.position.y,
        bPos["Bip01_LInnerEyebrow"].y + browVal * 0.008 + browRaise,
        delta * 10,
      );
    }
    if (rBrow && bPos["Bip01_RInnerEyebrow"]) {
      rBrow.position.y = THREE.MathUtils.lerp(
        rBrow.position.y,
        bPos["Bip01_RInnerEyebrow"].y + browVal * 0.008 + browRaise,
        delta * 10,
      );
    }

    // Head & Body gaze direction (towards board or student)
    const head = bMap["Head"];
    const neck = bMap["Bip01_Neck"];
    const spine = bMap["Bip01_Spine"];
    const isBoardLeft = boardSide === "left";

    let targetBodyY = 0;
    let targetHeadY = 0;
    if (lookAt === "board") {
      targetBodyY = isBoardLeft ? 0.35 : -0.35;
      targetHeadY = isBoardLeft ? 0.45 : -0.45;
    }

    if (spine && bRot["Bip01_Spine"]) {
      spine.rotation.y = THREE.MathUtils.lerp(
        spine.rotation.y,
        bRot["Bip01_Spine"].y + targetBodyY,
        delta * 5,
      );
    }

    if (head && bRot["Head"]) {
      const targetTilt = expression === "think" ? 0.08 : headTilt;
      // Add curious idle tilt on top of any explicit tilt
      head.rotation.z = THREE.MathUtils.lerp(
        head.rotation.z,
        bRot["Head"].z + targetTilt + curiousTilt,
        delta * 4,
      );
      head.rotation.y = THREE.MathUtils.lerp(
        head.rotation.y,
        bRot["Head"].y + targetHeadY,
        delta * 5,
      );
      // Approving nod on x
      head.rotation.x = THREE.MathUtils.lerp(
        head.rotation.x,
        bRot["Head"].x + approveNod,
        delta * 4,
      );
    }

    // Lifelike Eye Blinking every ~3.5 seconds
    const lBlinkTop = bMap["Bip01_LEyeBlinkTop"];
    const rBlinkTop = bMap["Bip01_REyeBlinkTop"];
    const blinkCycle = (time * 0.7) % 3.6;
    let blinkValue = 0;
    if (blinkCycle < 0.16) {
      blinkValue = Math.sin((blinkCycle / 0.16) * Math.PI);
    }
    if (lBlinkTop && bPos["Bip01_LEyeBlinkTop"]) {
      lBlinkTop.position.y = bPos["Bip01_LEyeBlinkTop"].y - blinkValue * 0.007;
    }
    if (rBlinkTop && bPos["Bip01_REyeBlinkTop"]) {
      rBlinkTop.position.y = bPos["Bip01_REyeBlinkTop"].y - blinkValue * 0.007;
    }

    // Leg Bones and Pelvis for Walking
    const lThigh = bMap["Bip01_L_Thigh"];
    const rThigh = bMap["Bip01_R_Thigh"];
    const lCalf = bMap["Bip01_L_Calf"];
    const rCalf = bMap["Bip01_R_Calf"];
    const lFoot = bMap["Bip01_L_Foot"];
    const rFoot = bMap["Bip01_R_Foot"];
    const pelvis = bMap["Bip01_Pelvis"];
    const lUpperArm = bMap["Bip01_L_UpperArm"];
    const lForearm = bMap["Bip01_L_Forearm"];
    const rUpperArm = bMap["Bip01_R_UpperArm"];
    const rForearm = bMap["Bip01_R_Forearm"];

    // Target Center X based on focus position (Left Visual Board, Center Text Rule, Right Circular Model)
    let baseTargetX = 0;
    let focusArmAngle = 0;
    let focusBodyY = 0;

    if (focusPosition === "visual") {
      baseTargetX = -0.75;
      focusArmAngle = 0.25;
      focusBodyY = 0.18;
    } else if (focusPosition === "ring") {
      baseTargetX = 0.75;
      focusArmAngle = -0.3;
      focusBodyY = -0.18;
    } else {
      baseTargetX = -0.05;
      focusArmAngle = 0.0;
      focusBodyY = 0.0;
    }

    // ── GREETING WAVE override — applied AFTER all other arm logic ───
    // We'll set a flag and override rUpperArm/rForearm at the very end.

    if (isWalking) {
      // ─────────────────────────────────────────────────────────────────
      // NATURAL WALKING — teacher paces slowly left↔right like a real
      // presenter, always facing the viewer (camera).
      //
      // KEY PRINCIPLES:
      //  • Legs swing on the FORWARD/BACK axis (rotation.x on thigh/calf)
      //    NOT on .z or .y — those cause ballet/dancing artefacts.
      //  • Knee bends only on the SWING leg, never over-extends.
      //  • Pelvis bobs vertically ~1cm per step, minimal lateral sway.
      //  • Arms swing front↔back opposite to legs, hands stay close to body.
      //  • Body never rotates sideways more than ~8° — she always faces viewer.
      //  • Walk speed is calm and professional (~1.1 steps/sec).
      // ─────────────────────────────────────────────────────────────────

      // Advance walk phase at a calm, natural cadence
      // walkSpeed prop controls pace; default multiplier keeps it ~1.1 steps/sec
      walkTime.current += delta * walkSpeed * 0.48;
      const wt = walkTime.current;

      // Left-right pacing position (sinusoidal, slow)
      // Teacher moves between baseTargetX ± 0.42 units
      const PACE_RANGE = 0.42;
      const PACE_FREQ = 0.45; // full cycle every ~14 seconds
      const targetX = baseTargetX + Math.sin(wt * PACE_FREQ) * PACE_RANGE;
      const targetZ = 0.0; // never drift toward/away from camera

      // Instantaneous X-velocity → which direction she's walking
      const velX = Math.cos(wt * PACE_FREQ) * PACE_RANGE * PACE_FREQ;
      const movingRight = velX > 0.008;
      const movingLeft = velX < -0.008;
      const isMoving = Math.abs(velX) > 0.008;

      // Tiny body lean INTO direction of travel (max ±5°)
      const leanAngle = isMoving ? (movingRight ? -0.09 : 0.09) : 0.0;

      if (model) {
        model.position.x = THREE.MathUtils.lerp(
          model.position.x,
          targetX,
          delta * 3.5,
        );
        model.position.z = THREE.MathUtils.lerp(
          model.position.z,
          targetZ,
          delta * 3.5,
        );
        // Face viewer at all times — only a tiny lean, no spinning
        model.rotation.y = THREE.MathUtils.lerp(
          model.rotation.y,
          leanAngle,
          delta * 4,
        );
      }

      // Head stays locked on viewer — gently nods during speech
      if (head && bRot["Head"]) {
        const nodX = isSpeaking
          ? Math.sin(time * 2.5) * 0.028
          : Math.sin(time * 1.4) * 0.012;
        const tiltZ = Math.sin(time * 0.7) * 0.015; // subtle life tilt
        head.rotation.y = THREE.MathUtils.lerp(
          head.rotation.y,
          bRot["Head"].y - leanAngle * 0.7,
          delta * 5,
        );
        head.rotation.x = THREE.MathUtils.lerp(
          head.rotation.x,
          bRot["Head"].x + nodX,
          delta * 5,
        );
        head.rotation.z = THREE.MathUtils.lerp(
          head.rotation.z,
          bRot["Head"].z + tiltZ,
          delta * 5,
        );
      }

      // ── STRIDE CYCLE ──────────────────────────────────────────────
      // Advance walk cycle proportional to actual movement speed so legs
      // match ground speed and never spin in place when she pauses.
      const groundSpeed = Math.min(
        1.0,
        Math.abs(velX) / (PACE_RANGE * PACE_FREQ),
      );
      walkCycle.current += delta * groundSpeed * 3.6; // ~1.8 Hz stride at full speed
      const wc = walkCycle.current;

      // Leg swing amplitude — proportional to how fast she's moving
      const swingAmp = groundSpeed * 0.34; // max ~20° thigh swing
      const swingL = Math.sin(wc); // left leg phase
      const swingR = -Math.sin(wc); // right leg opposite

      // THIGHS: swing ONLY on x-axis (forward/back). No z or y rotation.
      if (lThigh && bRot["Bip01_L_Thigh"]) {
        lThigh.rotation.x = THREE.MathUtils.lerp(
          lThigh.rotation.x,
          bRot["Bip01_L_Thigh"].x + swingL * swingAmp,
          delta * 10,
        );
        // Reset any residual z/y from previous code
        lThigh.rotation.z = THREE.MathUtils.lerp(
          lThigh.rotation.z,
          bRot["Bip01_L_Thigh"].z,
          delta * 10,
        );
        lThigh.rotation.y = THREE.MathUtils.lerp(
          lThigh.rotation.y,
          bRot["Bip01_L_Thigh"].y,
          delta * 10,
        );
      }
      if (rThigh && bRot["Bip01_R_Thigh"]) {
        rThigh.rotation.x = THREE.MathUtils.lerp(
          rThigh.rotation.x,
          bRot["Bip01_R_Thigh"].x + swingR * swingAmp,
          delta * 10,
        );
        rThigh.rotation.z = THREE.MathUtils.lerp(
          rThigh.rotation.z,
          bRot["Bip01_R_Thigh"].z,
          delta * 10,
        );
        rThigh.rotation.y = THREE.MathUtils.lerp(
          rThigh.rotation.y,
          bRot["Bip01_R_Thigh"].y,
          delta * 10,
        );
      }

      // CALVES: bend on x-axis when leg is in swing-back phase (never hyper-extend)
      // kneeBend is clamped to [0, 1] — knee only bends backward, not forward
      const kneeBendL = Math.max(0, swingL) * swingAmp * 0.7; // swing phase only
      const kneeBendR = Math.max(0, swingR) * swingAmp * 0.7;
      if (lCalf && bRot["Bip01_L_Calf"]) {
        lCalf.rotation.x = THREE.MathUtils.lerp(
          lCalf.rotation.x,
          bRot["Bip01_L_Calf"].x + kneeBendL,
          delta * 10,
        );
        lCalf.rotation.z = THREE.MathUtils.lerp(
          lCalf.rotation.z,
          bRot["Bip01_L_Calf"].z,
          delta * 10,
        );
      }
      if (rCalf && bRot["Bip01_R_Calf"]) {
        rCalf.rotation.x = THREE.MathUtils.lerp(
          rCalf.rotation.x,
          bRot["Bip01_R_Calf"].x + kneeBendR,
          delta * 10,
        );
        rCalf.rotation.z = THREE.MathUtils.lerp(
          rCalf.rotation.z,
          bRot["Bip01_R_Calf"].z,
          delta * 10,
        );
      }

      // FEET: slight toe-down during swing (heel-strike feel), flat on stance
      const toeDownL = Math.max(0, -swingL) * swingAmp * 0.3;
      const toeDownR = Math.max(0, -swingR) * swingAmp * 0.3;
      if (lFoot && bRot["Bip01_L_Foot"]) {
        lFoot.rotation.x = THREE.MathUtils.lerp(
          lFoot.rotation.x,
          bRot["Bip01_L_Foot"].x + toeDownL,
          delta * 10,
        );
        lFoot.rotation.z = THREE.MathUtils.lerp(
          lFoot.rotation.z,
          bRot["Bip01_L_Foot"].z,
          delta * 10,
        );
      }
      if (rFoot && bRot["Bip01_R_Foot"]) {
        rFoot.rotation.x = THREE.MathUtils.lerp(
          rFoot.rotation.x,
          bRot["Bip01_R_Foot"].x + toeDownR,
          delta * 10,
        );
        rFoot.rotation.z = THREE.MathUtils.lerp(
          rFoot.rotation.z,
          bRot["Bip01_R_Foot"].z,
          delta * 10,
        );
      }

      // PELVIS: tiny vertical bob (~8mm) and minimal lateral tilt (~1°)
      // No rotation.y spinning — that's what caused the "dance" look
      if (pelvis && bPos["Bip01_Pelvis"] && bRot["Bip01_Pelvis"]) {
        const bobY = Math.abs(Math.sin(wc)) * 0.008 * groundSpeed;
        const tiltZ = Math.sin(wc) * 0.018 * groundSpeed; // weight-shift lean
        pelvis.position.y = THREE.MathUtils.lerp(
          pelvis.position.y,
          bPos["Bip01_Pelvis"].y + bobY,
          delta * 10,
        );
        pelvis.rotation.z = THREE.MathUtils.lerp(
          pelvis.rotation.z,
          bRot["Bip01_Pelvis"].z + tiltZ,
          delta * 10,
        );
        pelvis.rotation.y = THREE.MathUtils.lerp(
          pelvis.rotation.y,
          bRot["Bip01_Pelvis"].y,
          delta * 10,
        );
        pelvis.rotation.x = THREE.MathUtils.lerp(
          pelvis.rotation.x,
          bRot["Bip01_Pelvis"].x,
          delta * 10,
        );
      }

      // SPINE: upright, just a tiny counter-rotation to pelvis
      if (spine && bRot["Bip01_Spine"]) {
        spine.rotation.x = THREE.MathUtils.lerp(
          spine.rotation.x,
          bRot["Bip01_Spine"].x + 0.015,
          delta * 8,
        );
        spine.rotation.y = THREE.MathUtils.lerp(
          spine.rotation.y,
          bRot["Bip01_Spine"].y,
          delta * 8,
        );
        spine.rotation.z = THREE.MathUtils.lerp(
          spine.rotation.z,
          bRot["Bip01_Spine"].z,
          delta * 8,
        );
      }

      // ── ARMS ────────────────────────────────────────────────────────
      // Arms swing front↔back on x-axis OPPOSITE to ipsilateral leg.
      // No .y rotation — that flares the arm sideways like a wing.
      // Amplitude is small (~12°) — teacher, not a power-walker.
      const armSwingAmp = groundSpeed * 0.18;
      const armSwingL = -swingL * armSwingAmp; // left arm opposite to left leg
      const armSwingR = -swingR * armSwingAmp; // right arm opposite to right leg

      // LEFT ARM — down at side, slight natural swing
      if (lUpperArm && bRot["Bip01_L_UpperArm"]) {
        lUpperArm.rotation.x = THREE.MathUtils.lerp(
          lUpperArm.rotation.x,
          bRot["Bip01_L_UpperArm"].x + armSwingL,
          delta * 7,
        );
        // NO y rotation — keep arm close to body
        lUpperArm.rotation.y = THREE.MathUtils.lerp(
          lUpperArm.rotation.y,
          bRot["Bip01_L_UpperArm"].y,
          delta * 7,
        );
        lUpperArm.rotation.z = THREE.MathUtils.lerp(
          lUpperArm.rotation.z,
          bRot["Bip01_L_UpperArm"].z,
          delta * 7,
        );
      }
      if (lForearm && bRot["Bip01_L_Forearm"]) {
        // Elbow bends slightly on the back-swing
        const elbowBendL = Math.max(0, armSwingL) * 0.4;
        lForearm.rotation.x = THREE.MathUtils.lerp(
          lForearm.rotation.x,
          bRot["Bip01_L_Forearm"].x + elbowBendL,
          delta * 7,
        );
        lForearm.rotation.z = THREE.MathUtils.lerp(
          lForearm.rotation.z,
          bRot["Bip01_L_Forearm"].z,
          delta * 7,
        );
      }

      // RIGHT ARM — gesture / explain pose based on focusPosition
      // Raised toward the presentation area, gently animated
      const gesturePulse = Math.sin(time * 1.6) * 0.06; // subtle alive motion
      const gestureRaiseX = isSpeaking
        ? -0.28 + Math.sin(time * 2.2) * 0.06 // talking: slight nod-gesture
        : -0.22 + armSwingR; // walking: natural swing

      if (rUpperArm && bRot["Bip01_R_UpperArm"]) {
        rUpperArm.rotation.x = THREE.MathUtils.lerp(
          rUpperArm.rotation.x,
          bRot["Bip01_R_UpperArm"].x + gestureRaiseX,
          delta * 5,
        );
        // Slight outward rotation (not excessive — just natural arm-away-from-body)
        rUpperArm.rotation.y = THREE.MathUtils.lerp(
          rUpperArm.rotation.y,
          bRot["Bip01_R_UpperArm"].y + focusArmAngle * 0.5,
          delta * 5,
        );
        rUpperArm.rotation.z = THREE.MathUtils.lerp(
          rUpperArm.rotation.z,
          bRot["Bip01_R_UpperArm"].z,
          delta * 5,
        );
      }
      if (rForearm && bRot["Bip01_R_Forearm"]) {
        const forearmBend = isSpeaking ? -0.35 + gesturePulse : -0.18;
        rForearm.rotation.x = THREE.MathUtils.lerp(
          rForearm.rotation.x,
          bRot["Bip01_R_Forearm"].x + forearmBend,
          delta * 6,
        );
        rForearm.rotation.z = THREE.MathUtils.lerp(
          rForearm.rotation.z,
          bRot["Bip01_R_Forearm"].z,
          delta * 6,
        );
      }
    } else {
      // ─────────────────────────────────────────────────────────────────
      // STANDING / IDLE — natural neutral stance facing viewer.
      // Feet shoulder-width apart, arms relaxed at sides.
      // ─────────────────────────────────────────────────────────────────

      if (model) {
        model.position.x = THREE.MathUtils.lerp(
          model.position.x,
          baseTargetX,
          delta * 3,
        );
        model.position.z = THREE.MathUtils.lerp(model.position.z, 0, delta * 3);
        model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, 0, delta * 4);
      }

      // Head: gentle living idle — tiny nod and side-glance
      if (head && bRot["Head"]) {
        const idleNodX = Math.sin(time * 1.3) * 0.016;
        const idleTiltZ = Math.sin(time * 0.6) * 0.012;
        head.rotation.x = THREE.MathUtils.lerp(
          head.rotation.x,
          bRot["Head"].x + idleNodX,
          delta * 4,
        );
        head.rotation.y = THREE.MathUtils.lerp(
          head.rotation.y,
          bRot["Head"].y,
          delta * 4,
        );
        head.rotation.z = THREE.MathUtils.lerp(
          head.rotation.z,
          bRot["Head"].z + idleTiltZ,
          delta * 4,
        );
      }

      // Legs — reset to neutral standing
      const resetSpeed = delta * 5;
      if (lThigh && bRot["Bip01_L_Thigh"]) {
        lThigh.rotation.x = THREE.MathUtils.lerp(
          lThigh.rotation.x,
          bRot["Bip01_L_Thigh"].x,
          resetSpeed,
        );
        lThigh.rotation.z = THREE.MathUtils.lerp(
          lThigh.rotation.z,
          bRot["Bip01_L_Thigh"].z,
          resetSpeed,
        );
        lThigh.rotation.y = THREE.MathUtils.lerp(
          lThigh.rotation.y,
          bRot["Bip01_L_Thigh"].y,
          resetSpeed,
        );
      }
      if (rThigh && bRot["Bip01_R_Thigh"]) {
        rThigh.rotation.x = THREE.MathUtils.lerp(
          rThigh.rotation.x,
          bRot["Bip01_R_Thigh"].x,
          resetSpeed,
        );
        rThigh.rotation.z = THREE.MathUtils.lerp(
          rThigh.rotation.z,
          bRot["Bip01_R_Thigh"].z,
          resetSpeed,
        );
        rThigh.rotation.y = THREE.MathUtils.lerp(
          rThigh.rotation.y,
          bRot["Bip01_R_Thigh"].y,
          resetSpeed,
        );
      }
      if (lCalf && bRot["Bip01_L_Calf"]) {
        lCalf.rotation.x = THREE.MathUtils.lerp(
          lCalf.rotation.x,
          bRot["Bip01_L_Calf"].x,
          resetSpeed,
        );
        lCalf.rotation.z = THREE.MathUtils.lerp(
          lCalf.rotation.z,
          bRot["Bip01_L_Calf"].z,
          resetSpeed,
        );
      }
      if (rCalf && bRot["Bip01_R_Calf"]) {
        rCalf.rotation.x = THREE.MathUtils.lerp(
          rCalf.rotation.x,
          bRot["Bip01_R_Calf"].x,
          resetSpeed,
        );
        rCalf.rotation.z = THREE.MathUtils.lerp(
          rCalf.rotation.z,
          bRot["Bip01_R_Calf"].z,
          resetSpeed,
        );
      }
      if (lFoot && bRot["Bip01_L_Foot"]) {
        lFoot.rotation.x = THREE.MathUtils.lerp(
          lFoot.rotation.x,
          bRot["Bip01_L_Foot"].x,
          resetSpeed,
        );
        lFoot.rotation.z = THREE.MathUtils.lerp(
          lFoot.rotation.z,
          bRot["Bip01_L_Foot"].z,
          resetSpeed,
        );
      }
      if (rFoot && bRot["Bip01_R_Foot"]) {
        rFoot.rotation.x = THREE.MathUtils.lerp(
          rFoot.rotation.x,
          bRot["Bip01_R_Foot"].x,
          resetSpeed,
        );
        rFoot.rotation.z = THREE.MathUtils.lerp(
          rFoot.rotation.z,
          bRot["Bip01_R_Foot"].z,
          resetSpeed,
        );
      }
      if (pelvis && bPos["Bip01_Pelvis"] && bRot["Bip01_Pelvis"]) {
        pelvis.position.y = THREE.MathUtils.lerp(
          pelvis.position.y,
          bPos["Bip01_Pelvis"].y,
          resetSpeed,
        );
        pelvis.rotation.x = THREE.MathUtils.lerp(
          pelvis.rotation.x,
          bRot["Bip01_Pelvis"].x,
          resetSpeed,
        );
        pelvis.rotation.y = THREE.MathUtils.lerp(
          pelvis.rotation.y,
          bRot["Bip01_Pelvis"].y,
          resetSpeed,
        );
        pelvis.rotation.z = THREE.MathUtils.lerp(
          pelvis.rotation.z,
          bRot["Bip01_Pelvis"].z,
          resetSpeed,
        );
      }
      if (spine && bRot["Bip01_Spine"]) {
        spine.rotation.x = THREE.MathUtils.lerp(
          spine.rotation.x,
          bRot["Bip01_Spine"].x + 0.01,
          resetSpeed,
        );
        spine.rotation.y = THREE.MathUtils.lerp(
          spine.rotation.y,
          bRot["Bip01_Spine"].y,
          resetSpeed,
        );
        spine.rotation.z = THREE.MathUtils.lerp(
          spine.rotation.z,
          bRot["Bip01_Spine"].z,
          resetSpeed,
        );
      }

      // ARMS — relaxed at sides, a little alive from breathing
      const breathSway = Math.sin(time * 1.6) * 0.008; // almost imperceptible
      if (lUpperArm && bRot["Bip01_L_UpperArm"]) {
        lUpperArm.rotation.x = THREE.MathUtils.lerp(
          lUpperArm.rotation.x,
          bRot["Bip01_L_UpperArm"].x + breathSway,
          delta * 4,
        );
        lUpperArm.rotation.y = THREE.MathUtils.lerp(
          lUpperArm.rotation.y,
          bRot["Bip01_L_UpperArm"].y,
          delta * 4,
        );
        lUpperArm.rotation.z = THREE.MathUtils.lerp(
          lUpperArm.rotation.z,
          bRot["Bip01_L_UpperArm"].z,
          delta * 4,
        );
      }
      if (lForearm && bRot["Bip01_L_Forearm"]) {
        lForearm.rotation.x = THREE.MathUtils.lerp(
          lForearm.rotation.x,
          bRot["Bip01_L_Forearm"].x,
          delta * 4,
        );
        lForearm.rotation.z = THREE.MathUtils.lerp(
          lForearm.rotation.z,
          bRot["Bip01_L_Forearm"].z,
          delta * 4,
        );
      }

      // Right arm: natural idle OR gentle pointing gesture toward focus panel
      const idleGesture = isSpeaking
        ? -0.22 + Math.sin(time * 2.0) * 0.05
        : -0.08 + breathSway;
      if (rUpperArm && bRot["Bip01_R_UpperArm"]) {
        rUpperArm.rotation.x = THREE.MathUtils.lerp(
          rUpperArm.rotation.x,
          bRot["Bip01_R_UpperArm"].x + idleGesture,
          delta * 4,
        );
        rUpperArm.rotation.y = THREE.MathUtils.lerp(
          rUpperArm.rotation.y,
          bRot["Bip01_R_UpperArm"].y + focusArmAngle * 0.4,
          delta * 4,
        );
        rUpperArm.rotation.z = THREE.MathUtils.lerp(
          rUpperArm.rotation.z,
          bRot["Bip01_R_UpperArm"].z,
          delta * 4,
        );
      }
      if (rForearm && bRot["Bip01_R_Forearm"]) {
        const forearmIdle = isSpeaking ? -0.28 : -0.05;
        rForearm.rotation.x = THREE.MathUtils.lerp(
          rForearm.rotation.x,
          bRot["Bip01_R_Forearm"].x + forearmIdle,
          delta * 4,
        );
        rForearm.rotation.z = THREE.MathUtils.lerp(
          rForearm.rotation.z,
          bRot["Bip01_R_Forearm"].z,
          delta * 4,
        );
      }
    }

    // ── GREETING WAVE — overrides right arm for first 2.2 s ─────────
    // Pattern: arm swings up fast (0.0–0.4 s), wrist wiggles left↔right
    // twice (0.4–1.8 s), arm returns to side (1.8–2.2 s).
    // We use timeSinceMount which is always valid after mount.
    if (isWaving && rUpperArm && rForearm && bRot["Bip01_R_UpperArm"] && bRot["Bip01_R_Forearm"]) {
      const t = timeSinceMount; // 0 → 2.2

      // Phase 1: raise arm (0 → 0.4 s)
      const raiseT = Math.min(1, t / 0.4);
      const raiseEase = raiseT < 0.5
        ? 2 * raiseT * raiseT
        : 1 - Math.pow(-2 * raiseT + 2, 2) / 2; // ease-in-out quad
      const armRaiseX = -raiseEase * 1.05; // raise ~60° up

      // Phase 2: wrist wave (0.35 → 1.85 s), two full wiggles
      const waveT = Math.max(0, (t - 0.35) / 1.5); // 0 → 1 over 1.5 s
      const waveActive = waveT > 0 && waveT < 1;
      const forearmWave = waveActive
        ? Math.sin(waveT * Math.PI * 2.5) * 0.55 // two+ swings
        : 0;

      // Phase 3: return arm (1.8 → 2.2 s)
      const returnT = Math.max(0, (t - 1.8) / 0.4);
      const returnEase = returnT * returnT; // ease-in
      const finalArmX = armRaiseX * (1 - returnEase);

      rUpperArm.rotation.x = THREE.MathUtils.lerp(
        rUpperArm.rotation.x,
        bRot["Bip01_R_UpperArm"].x + finalArmX,
        delta * 18,
      );
      // Keep arm close to body laterally during wave
      rUpperArm.rotation.y = THREE.MathUtils.lerp(
        rUpperArm.rotation.y,
        bRot["Bip01_R_UpperArm"].y,
        delta * 12,
      );
      // Forearm: rotate for the wrist-wave (Z axis = side-to-side wag)
      rForearm.rotation.z = THREE.MathUtils.lerp(
        rForearm.rotation.z,
        bRot["Bip01_R_Forearm"].z + forearmWave * (1 - returnEase),
        delta * 14,
      );
      rForearm.rotation.x = THREE.MathUtils.lerp(
        rForearm.rotation.x,
        bRot["Bip01_R_Forearm"].x + (waveActive ? -0.3 : 0) * (1 - returnEase),
        delta * 14,
      );
    }
  });

  return model ? <primitive ref={groupRef} object={model} /> : null;
}
