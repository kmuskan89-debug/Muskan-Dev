import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 3D Robot Girl built strictly from R3F primitives (no external model files).
 * Palette ONLY:
 * - Glossy White: #FFFFFF (MeshPhysicalMaterial with clearcoat)
 * - Ink: #1A110A
 * - Orange Glow: #F79F15
 * - Cream: #F5F3E7
 * - Grey: #9F9B90
 */
export default function RobotGirl({ shouldReduceMotion = false, isTabActive = true }) {
  const rootGroupRef = useRef();
  const bodyGroupRef = useRef();
  const headGroupRef = useRef();
  const antennaGroupRef = useRef();
  const eyeLeftGroupRef = useRef();
  const eyeRightGroupRef = useRef();
  const pupilLeftRef = useRef();
  const pupilRightRef = useRef();

  // Interaction & motion states
  const [isHappy, setIsHappy] = useState(false);
  const happyTimerRef = useRef(0);
  const blinkTimerRef = useRef(3.2);
  const isBlinkingRef = useRef(false);
  const blinkProgressRef = useRef(0);

  // Pointer position tracking (-1 to 1)
  const pointerRef = useRef({ x: 0, y: 0, isInside: false });
  const touchActiveRef = useRef(false);

  // Materials definition (reusable and optimized)
  const materials = useMemo(() => {
    return {
      whiteGlossy: new THREE.MeshPhysicalMaterial({
        color: "#FFFFFF",
        roughness: 0.15,
        metalness: 0.05,
        clearcoat: 0.9,
        clearcoatRoughness: 0.12,
      }),
      inkPlate: new THREE.MeshPhysicalMaterial({
        color: "#1A110A",
        roughness: 0.2,
        metalness: 0.1,
        clearcoat: 0.7,
      }),
      inkHair: new THREE.MeshStandardMaterial({
        color: "#1A110A",
        roughness: 0.4,
        metalness: 0.05,
      }),
      orangeGlow: new THREE.MeshStandardMaterial({
        color: "#F79F15",
        emissive: "#F79F15",
        emissiveIntensity: 0.85,
        roughness: 0.2,
      }),
      orangeTie: new THREE.MeshStandardMaterial({
        color: "#F79F15",
        roughness: 0.3,
        metalness: 0.1,
      }),
      blush: new THREE.MeshBasicMaterial({
        color: "#F79F15",
        transparent: true,
        opacity: 0.65,
      }),
      eyeWhite: new THREE.MeshBasicMaterial({
        color: "#FFFFFF",
      }),
      discGlow: new THREE.MeshBasicMaterial({
        color: "#F79F15",
        transparent: true,
        opacity: 0.18,
      }),
      shadow: new THREE.MeshBasicMaterial({
        color: "#1A110A",
        transparent: true,
        opacity: 0.14,
      }),
      accentGrey: new THREE.MeshStandardMaterial({
        color: "#9F9B90",
        roughness: 0.3,
        metalness: 0.6,
      }),
    };
  }, []);

  // Track global cursor movement anywhere on the page
  useEffect(() => {
    if (shouldReduceMotion) return;

    const handlePointerMove = (e) => {
      touchActiveRef.current = false;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current = { x, y, isInside: true };
    };

    const handleMouseLeave = () => {
      pointerRef.current.isInside = false;
    };

    const handleMouseEnter = () => {
      pointerRef.current.isInside = true;
    };

    // Touch handlers for finger tracking
    const handleTouchStart = (e) => {
      touchActiveRef.current = true;
      const touch = e.touches[0];
      if (touch) {
        const x = (touch.clientX / window.innerWidth) * 2 - 1;
        const y = -(touch.clientY / window.innerHeight) * 2 + 1;
        pointerRef.current = { x, y, isInside: true };
      }
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      if (touch) {
        const x = (touch.clientX / window.innerWidth) * 2 - 1;
        const y = -(touch.clientY / window.innerHeight) * 2 + 1;
        pointerRef.current = { x, y, isInside: true };
      }
    };

    const handleTouchEnd = () => {
      touchActiveRef.current = false;
      pointerRef.current.isInside = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [shouldReduceMotion]);

  // Click/tap interaction: happy bounce and "^ ^" eyes for 0.8s
  const handleRobotClick = (e) => {
    e.stopPropagation();
    happyTimerRef.current = 0.8;
    setIsHappy(true);
  };

  // Main animation frame loop
  useFrame((state, delta) => {
    if (!rootGroupRef.current || !isTabActive) return;

    const t = state.clock.getElapsedTime();

    // 1. Static pose for prefers-reduced-motion
    if (shouldReduceMotion) {
      if (headGroupRef.current) {
        headGroupRef.current.rotation.set(0, 0, 0);
      }
      if (bodyGroupRef.current) {
        bodyGroupRef.current.rotation.set(0, 0, 0);
        bodyGroupRef.current.position.set(0, -0.65, 0);
      }
      if (pupilLeftRef.current) pupilLeftRef.current.position.set(0, 0, 0.02);
      if (pupilRightRef.current) pupilRightRef.current.position.set(0, 0, 0.02);
      return;
    }

    // 2. Happy state timer
    if (happyTimerRef.current > 0) {
      happyTimerRef.current -= delta;
      if (happyTimerRef.current <= 0) {
        setIsHappy(false);
      }
    }

    // 3. Blinking cycle: random every 3-5 seconds
    if (!isBlinkingRef.current) {
      blinkTimerRef.current -= delta;
      if (blinkTimerRef.current <= 0) {
        isBlinkingRef.current = true;
        blinkProgressRef.current = 0;
        blinkTimerRef.current = 3.0 + Math.random() * 2.0;
      }
    } else {
      // Fast blink (~140ms duration)
      blinkProgressRef.current += delta * 7.5;
      if (blinkProgressRef.current >= 1) {
        isBlinkingRef.current = false;
        blinkProgressRef.current = 0;
      }
    }

    // Eye scale: closed when blinking
    let eyeScaleY = 1.0;
    if (isBlinkingRef.current) {
      eyeScaleY = Math.max(0.08, Math.sin(blinkProgressRef.current * Math.PI * 2));
    }
    if (eyeLeftGroupRef.current) eyeLeftGroupRef.current.scale.y = eyeScaleY;
    if (eyeRightGroupRef.current) eyeRightGroupRef.current.scale.y = eyeScaleY;

    // 4. Target Yaw and Pitch calculation
    let targetX = 0;
    let targetY = 0;

    if (pointerRef.current.isInside) {
      targetX = pointerRef.current.x;
      targetY = pointerRef.current.y;
    } else {
      // Idle wandering when cursor left window or idle on touch
      targetX = Math.sin(t * 0.7) * 0.35;
      targetY = Math.cos(t * 0.5) * 0.18;
    }

    // Maximum head angles: Yaw up to 28deg (0.488 rad), Pitch up to 16deg (0.279 rad)
    const maxYaw = 28 * (Math.PI / 180);
    const maxPitch = 16 * (Math.PI / 180);

    const targetHeadYaw = targetX * maxYaw;
    const targetHeadPitch = -targetY * maxPitch;

    // Smooth head follow using THREE.MathUtils.damp
    if (headGroupRef.current) {
      headGroupRef.current.rotation.y = THREE.MathUtils.damp(
        headGroupRef.current.rotation.y,
        targetHeadYaw,
        6,
        delta
      );
      headGroupRef.current.rotation.x = THREE.MathUtils.damp(
        headGroupRef.current.rotation.x,
        targetHeadPitch,
        6,
        delta
      );
    }

    // 5. Pupils slide faster and further on the face plate
    const maxPupilSlideX = 0.055;
    const maxPupilSlideY = 0.04;
    const targetPupilX = targetX * maxPupilSlideX;
    const targetPupilY = targetY * maxPupilSlideY;

    if (pupilLeftRef.current && pupilRightRef.current) {
      pupilLeftRef.current.position.x = THREE.MathUtils.damp(
        pupilLeftRef.current.position.x,
        targetPupilX,
        10,
        delta
      );
      pupilLeftRef.current.position.y = THREE.MathUtils.damp(
        pupilLeftRef.current.position.y,
        targetPupilY,
        10,
        delta
      );
      pupilRightRef.current.position.x = THREE.MathUtils.damp(
        pupilRightRef.current.position.x,
        targetPupilX,
        10,
        delta
      );
      pupilRightRef.current.position.y = THREE.MathUtils.damp(
        pupilRightRef.current.position.y,
        targetPupilY,
        10,
        delta
      );
    }

    // 6. Body lean and idle breathing
    const happyBounce =
      happyTimerRef.current > 0
        ? Math.sin((1 - happyTimerRef.current / 0.8) * Math.PI) * 0.28
        : 0;

    const breathOffset = Math.sin(t * 2.2) * 0.02;

    if (bodyGroupRef.current) {
      // Body leans slightly with head
      bodyGroupRef.current.rotation.y = THREE.MathUtils.damp(
        bodyGroupRef.current.rotation.y,
        targetHeadYaw * 0.35,
        4,
        delta
      );
      bodyGroupRef.current.rotation.z = THREE.MathUtils.damp(
        bodyGroupRef.current.rotation.z,
        -targetHeadYaw * 0.12,
        4,
        delta
      );

      // Y position combines base height, idle breathing, and happy bounce
      bodyGroupRef.current.position.y = THREE.MathUtils.damp(
        bodyGroupRef.current.position.y,
        -0.65 + breathOffset + happyBounce,
        12,
        delta
      );

      // Subtle chest expansion on breath
      const chestScale = 1 + Math.sin(t * 2.2) * 0.015;
      bodyGroupRef.current.scale.set(1, chestScale, 1);
    }

    // 7. Antenna gentle bobbing
    if (antennaGroupRef.current) {
      antennaGroupRef.current.rotation.z =
        Math.sin(t * 3.5) * 0.08 + (headGroupRef.current?.rotation.y || 0) * 0.2;
      antennaGroupRef.current.rotation.x =
        Math.cos(t * 2.8) * 0.06 - (headGroupRef.current?.rotation.x || 0) * 0.2;
    }
  });

  return (
    <group ref={rootGroupRef} onClick={handleRobotClick}>
      {/* 1. Large Soft Orange Disc Behind Her */}
      <mesh position={[0, 0.45, -1.8]}>
        <circleGeometry args={[2.5, 48]} />
        <primitive object={materials.discGlow} attach="material" />
      </mesh>

      {/* 2. Soft Ground Shadow */}
      <mesh position={[0, -1.75, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 1.4]} />
        <primitive object={materials.shadow} attach="material" />
      </mesh>

      {/* 3. Main Robot Assembly */}
      <group ref={bodyGroupRef} position={[0, -0.65, 0]}>
        {/* ============================================================ */}
        {/* TORSO & SHOULDERS (Glossy White with Ink Collar & Joints)     */}
        {/* ============================================================ */}
        {/* Upper Chest / Torso */}
        <mesh position={[0, -0.45, 0]} scale={[1.1, 0.95, 0.82]}>
          <sphereGeometry args={[0.85, 32, 24]} />
          <primitive object={materials.whiteGlossy} attach="material" />
        </mesh>

        {/* Chest Accent Plate (Ink / Orange bar) */}
        <mesh position={[0, -0.22, 0.65]}>
          <boxGeometry args={[0.42, 0.08, 0.08]} />
          <primitive object={materials.inkPlate} attach="material" />
        </mesh>
        <mesh position={[0, -0.22, 0.69]}>
          <boxGeometry args={[0.22, 0.04, 0.04]} />
          <primitive object={materials.orangeGlow} attach="material" />
        </mesh>

        {/* Neck Cylinder (Ink) */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.26, 0.32, 0.38, 24]} />
          <primitive object={materials.inkPlate} attach="material" />
        </mesh>

        {/* Neck Ring Accent (Orange) */}
        <mesh position={[0, 0.18, 0]}>
          <torusGeometry args={[0.28, 0.03, 12, 24]} />
          <primitive object={materials.orangeTie} attach="material" />
        </mesh>

        {/* Left Shoulder Ball */}
        <mesh position={[-0.95, -0.38, 0]}>
          <sphereGeometry args={[0.28, 24, 24]} />
          <primitive object={materials.whiteGlossy} attach="material" />
        </mesh>
        {/* Left Upper Arm Stub */}
        <mesh position={[-1.02, -0.72, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.18, 0.16, 0.55, 24]} />
          <primitive object={materials.whiteGlossy} attach="material" />
        </mesh>

        {/* Right Shoulder Ball */}
        <mesh position={[0.95, -0.38, 0]}>
          <sphereGeometry args={[0.28, 24, 24]} />
          <primitive object={materials.whiteGlossy} attach="material" />
        </mesh>
        {/* Right Upper Arm Stub */}
        <mesh position={[1.02, -0.72, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.18, 0.16, 0.55, 24]} />
          <primitive object={materials.whiteGlossy} attach="material" />
        </mesh>

        {/* ============================================================ */}
        {/* HEAD ASSEMBLY (Yaw & Pitch follows cursor)                   */}
        {/* ============================================================ */}
        <group ref={headGroupRef} position={[0, 0.95, 0]}>
          {/* Main Head Sphere (Glossy White) */}
          <mesh scale={[1.06, 0.98, 1.0]}>
            <sphereGeometry args={[0.95, 32, 32]} />
            <primitive object={materials.whiteGlossy} attach="material" />
          </mesh>

          {/* Face Plate (Curved Ink Visor) */}
          <mesh position={[0, -0.02, 0.44]} rotation={[0.08, 0, 0]} scale={[1.15, 0.82, 0.45]}>
            <sphereGeometry args={[0.76, 32, 24]} />
            <primitive object={materials.inkPlate} attach="material" />
          </mesh>

          {/* ========================================================== */}
          {/* FACE FEATURES: Eyes, Cheeks, Smile                         */}
          {/* ========================================================== */}
          {/* LEFT EYE ASSEMBLY */}
          <group ref={eyeLeftGroupRef} position={[-0.32, 0.04, 0.82]}>
            {isHappy ? (
              /* Happy "^" Left Eye */
              <group rotation={[0, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 4]} position={[-0.03, 0, 0]}>
                  <boxGeometry args={[0.12, 0.035, 0.02]} />
                  <primitive object={materials.orangeGlow} attach="material" />
                </mesh>
                <mesh rotation={[0, 0, -Math.PI / 4]} position={[0.03, 0, 0]}>
                  <boxGeometry args={[0.12, 0.035, 0.02]} />
                  <primitive object={materials.orangeGlow} attach="material" />
                </mesh>
              </group>
            ) : (
              /* Normal Round Glowing Orange Eye */
              <group ref={pupilLeftRef} position={[0, 0, 0.01]}>
                {/* Glowing Orange Pupil */}
                <mesh>
                  <circleGeometry args={[0.12, 24]} />
                  <primitive object={materials.orangeGlow} attach="material" />
                </mesh>
                {/* Top-Right White Catchlight Shine */}
                <mesh position={[0.038, 0.038, 0.005]}>
                  <circleGeometry args={[0.035, 16]} />
                  <primitive object={materials.eyeWhite} attach="material" />
                </mesh>
              </group>
            )}
          </group>

          {/* RIGHT EYE ASSEMBLY */}
          <group ref={eyeRightGroupRef} position={[0.32, 0.04, 0.82]}>
            {isHappy ? (
              /* Happy "^" Right Eye */
              <group rotation={[0, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 4]} position={[-0.03, 0, 0]}>
                  <boxGeometry args={[0.12, 0.035, 0.02]} />
                  <primitive object={materials.orangeGlow} attach="material" />
                </mesh>
                <mesh rotation={[0, 0, -Math.PI / 4]} position={[0.03, 0, 0]}>
                  <boxGeometry args={[0.12, 0.035, 0.02]} />
                  <primitive object={materials.orangeGlow} attach="material" />
                </mesh>
              </group>
            ) : (
              /* Normal Round Glowing Orange Eye */
              <group ref={pupilRightRef} position={[0, 0, 0.01]}>
                {/* Glowing Orange Pupil */}
                <mesh>
                  <circleGeometry args={[0.12, 24]} />
                  <primitive object={materials.orangeGlow} attach="material" />
                </mesh>
                {/* Top-Right White Catchlight Shine */}
                <mesh position={[0.038, 0.038, 0.005]}>
                  <circleGeometry args={[0.035, 16]} />
                  <primitive object={materials.eyeWhite} attach="material" />
                </mesh>
              </group>
            )}
          </group>

          {/* Left Blush Cheek */}
          <mesh position={[-0.46, -0.16, 0.74]} rotation={[0, -0.22, 0]}>
            <circleGeometry args={[0.075, 16]} />
            <primitive object={materials.blush} attach="material" />
          </mesh>

          {/* Right Blush Cheek */}
          <mesh position={[0.46, -0.16, 0.74]} rotation={[0, 0.22, 0]}>
            <circleGeometry args={[0.075, 16]} />
            <primitive object={materials.blush} attach="material" />
          </mesh>

          {/* Cute Tiny Smile Arc */}
          <mesh position={[0, -0.2, 0.82]} rotation={[Math.PI, 0, 0]}>
            <torusGeometry args={[0.07, 0.018, 8, 16, Math.PI]} />
            <primitive object={materials.orangeGlow} attach="material" />
          </mesh>

          {/* ========================================================== */}
          {/* EARS (Headphone style, Glossy White + Ink Ring)             */}
          {/* ========================================================== */}
          {/* Left Ear */}
          <group position={[-1.02, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.26, 0.26, 0.16, 24]} />
              <primitive object={materials.whiteGlossy} attach="material" />
            </mesh>
            <mesh position={[0, -0.09, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
              <primitive object={materials.orangeTie} attach="material" />
            </mesh>
          </group>

          {/* Right Ear */}
          <group position={[1.02, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.26, 0.26, 0.16, 24]} />
              <primitive object={materials.whiteGlossy} attach="material" />
            </mesh>
            <mesh position={[0, -0.09, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
              <primitive object={materials.orangeTie} attach="material" />
            </mesh>
          </group>

          {/* ========================================================== */}
          {/* HAIR: Two Buns with Orange Ties + Bangs Cap                */}
          {/* ========================================================== */}
          {/* Hair Cap (Sitting on crown in Ink) */}
          <mesh position={[0, 0.18, -0.08]} scale={[1.08, 0.88, 1.08]}>
            <sphereGeometry args={[0.88, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
            <primitive object={materials.inkHair} attach="material" />
          </mesh>

          {/* Left Hair Bun & Orange Tie */}
          <group position={[-0.82, 0.88, -0.15]}>
            {/* Orange Hair Tie */}
            <mesh position={[0, -0.1, 0]}>
              <torusGeometry args={[0.2, 0.05, 12, 24]} />
              <primitive object={materials.orangeTie} attach="material" />
            </mesh>
            {/* Ink Bun Sphere */}
            <mesh>
              <sphereGeometry args={[0.38, 24, 24]} />
              <primitive object={materials.inkHair} attach="material" />
            </mesh>
          </group>

          {/* Right Hair Bun & Orange Tie */}
          <group position={[0.82, 0.88, -0.15]}>
            {/* Orange Hair Tie */}
            <mesh position={[0, -0.1, 0]}>
              <torusGeometry args={[0.2, 0.05, 12, 24]} />
              <primitive object={materials.orangeTie} attach="material" />
            </mesh>
            {/* Ink Bun Sphere */}
            <mesh>
              <sphereGeometry args={[0.38, 24, 24]} />
              <primitive object={materials.inkHair} attach="material" />
            </mesh>
          </group>

          {/* ========================================================== */}
          {/* ANTENNA (Ink Stem + Glowing Orange Ball)                   */}
          {/* ========================================================== */}
          <group ref={antennaGroupRef} position={[0, 0.98, 0]}>
            {/* Antenna Base Socket */}
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 0.06, 16]} />
              <primitive object={materials.accentGrey} attach="material" />
            </mesh>
            {/* Antenna Stem */}
            <mesh position={[0, 0.24, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.42, 12]} />
              <primitive object={materials.inkPlate} attach="material" />
            </mesh>
            {/* Glowing Orange Ball on Tip */}
            <mesh position={[0, 0.48, 0]}>
              <sphereGeometry args={[0.12, 20, 20]} />
              <primitive object={materials.orangeGlow} attach="material" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

