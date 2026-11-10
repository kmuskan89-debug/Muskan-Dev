import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion, useSpring, useMotionValue, useReducedMotion } from "framer-motion";

/**
 * Interactive Hero Character:
 * - Uses the uploaded portrait cutout (/images/hero-girl-base.png)
 * - 3D head perspective tilt following the cursor (rotateY, rotateX, rotateZ, parallax)
 * - Live eye tracking with dynamic pupils and specular highlights moving toward the cursor
 * - Realistic natural blinking cycle & playful click/tap bounce reaction
 * - Mobile touch tracking and idle gaze wander
 */
export default function HeroCharacter({ className = "" }) {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Interaction states
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);

  // Motion values for head 3D orientation
  const headYaw = useMotionValue(0);
  const headPitch = useMotionValue(0);
  const headRoll = useMotionValue(0);
  const headParallaxX = useMotionValue(0);
  const headParallaxY = useMotionValue(0);

  // Motion values for eye pupils
  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);

  // Spring physics for organic, lifelike smoothing
  const springHead = { damping: 24, stiffness: 160, mass: 0.3 };
  const springPupils = { damping: 28, stiffness: 220, mass: 0.2 };

  const smoothYaw = useSpring(headYaw, springHead);
  const smoothPitch = useSpring(headPitch, springHead);
  const smoothRoll = useSpring(headRoll, springHead);
  const smoothTx = useSpring(headParallaxX, springHead);
  const smoothTy = useSpring(headParallaxY, springHead);

  const smoothPupilX = useSpring(pupilX, springPupils);
  const smoothPupilY = useSpring(pupilY, springPupils);

  // Target coordinates reference
  const targetRef = useRef({ x: 0, y: 0, isInside: false });
  const touchActiveRef = useRef(false);

  // Blinking loop: random blink every 3.5 to 5.5 seconds
  useEffect(() => {
    if (shouldReduceMotion) return;

    let blinkTimeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 140);

      const nextDelay = 3500 + Math.random() * 2000;
      blinkTimeout = setTimeout(triggerBlink, nextDelay);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, [shouldReduceMotion]);

  // Global pointer & touch listeners
  useEffect(() => {
    if (shouldReduceMotion) return;

    const handlePointerMove = (e) => {
      touchActiveRef.current = false;
      const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1 to 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1; // -1 (top) to 1 (bottom)
      targetRef.current = { x: nx, y: ny, isInside: true };
    };

    const handlePointerLeave = () => {
      targetRef.current.isInside = false;
    };

    const handleTouchStart = (e) => {
      touchActiveRef.current = true;
      const touch = e.touches[0];
      if (touch) {
        const nx = (touch.clientX / window.innerWidth) * 2 - 1;
        const ny = (touch.clientY / window.innerHeight) * 2 - 1;
        targetRef.current = { x: nx, y: ny, isInside: true };
      }
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      if (touch) {
        const nx = (touch.clientX / window.innerWidth) * 2 - 1;
        const ny = (touch.clientY / window.innerHeight) * 2 - 1;
        targetRef.current = { x: nx, y: ny, isInside: true };
      }
    };

    const handleTouchEnd = () => {
      touchActiveRef.current = false;
      targetRef.current.isInside = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [shouldReduceMotion]);

  // Animation frame loop: updates motion values smoothly
  useEffect(() => {
    if (shouldReduceMotion) return;

    let animFrame;
    let startTime = performance.now();

    const loop = (now) => {
      const elapsed = (now - startTime) * 0.001;
      let tx = 0;
      let ty = 0;

      if (targetRef.current.isInside) {
        tx = targetRef.current.x;
        ty = targetRef.current.y;
      } else {
        // Natural idle wander when cursor is idle or outside window
        tx = Math.sin(elapsed * 0.75) * 0.28;
        ty = Math.cos(elapsed * 0.5) * 0.16;
      }

      // Head 3D angles:
      // Yaw: turns left/right toward cursor (up to 13 deg)
      // Pitch: tilts up/down toward cursor (up to 8.5 deg)
      // Roll: subtle natural head tilt (up to 2.2 deg)
      const yawVal = tx * 13;
      const pitchVal = -ty * 8.5;
      const rollVal = tx * -2.2;

      // Parallax translation
      const pxVal = tx * 12;
      const pyVal = ty * 7;

      headYaw.set(yawVal);
      headPitch.set(pitchVal);
      headRoll.set(rollVal);
      headParallaxX.set(pxVal);
      headParallaxY.set(pyVal);

      // Eye pupil tracking:
      // Slides up to 6.2px horizontally, 4.2px vertically within eye socket
      const pupilXVal = tx * 6.2;
      const pupilYVal = ty * 4.2;

      pupilX.set(pupilXVal);
      pupilY.set(pupilYVal);

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [shouldReduceMotion, headYaw, headPitch, headRoll, headParallaxX, headParallaxY, pupilX, pupilY]);

  // Click / tap interaction: playful joyful bounce & wink
  const handleCharacterClick = useCallback(() => {
    setIsHappy(true);
    setTimeout(() => setIsHappy(false), 850);
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={handleCharacterClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label="Interactive character illustration of Muskan Kumari. Move cursor to guide her gaze."
      className={`relative select-none cursor-pointer flex items-end justify-center ${className}`}
      style={{ perspective: "1000px" }}
    >
      {/* 1. Large Soft Orange Backdrop Glow (Matching golden rim lighting) */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[440px] md:w-[480px] lg:w-[540px] h-[380px] sm:h-[440px] md:h-[480px] lg:h-[540px] rounded-full bg-[#F79F15]/18 blur-[80px] pointer-events-none -z-10"
      />

      {/* 2. Soft Ground Shadow Plane */}
      <div
        aria-hidden="true"
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[65%] h-6 rounded-full bg-[#1A110A]/12 blur-[14px] pointer-events-none -z-10"
      />

      {/* 3. Main Character Container (3D perspective tilt) */}
      <motion.div
        style={{
          rotateY: shouldReduceMotion ? 0 : smoothYaw,
          rotateX: shouldReduceMotion ? 0 : smoothPitch,
          rotateZ: shouldReduceMotion ? 0 : smoothRoll,
          x: shouldReduceMotion ? 0 : smoothTx,
          y: shouldReduceMotion ? 0 : smoothTy,
          transformStyle: "preserve-3d",
        }}
        animate={{
          scale: isHappy ? 1.04 : 1,
          translateY: isHappy ? -18 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 18,
        }}
        className="relative w-full max-w-[580px] aspect-[985/1024] pointer-events-auto"
      >
        {/* Base Character Cutout Image */}
        <img
          src="/images/hero-girl-base.png"
          alt="Muskan Kumari illustrated character"
          draggable={false}
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_12px_28px_rgba(26,17,10,0.18)]"
        />

        {/* ======================================================== */}
        {/* 4. DYNAMIC EYE TRACKING & BLINKING SVG LAYER             */}
        {/* Exact 1:1 pixel coordinate space with the 985x1024 image */}
        {/* ======================================================== */}
        <svg
          viewBox="0 0 985 1024"
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
        >
          <defs>
            {/* Left Eye Aperture Clip Path */}
            <clipPath id="heroLeftEyeAperture">
              <path d="M 444 286 Q 468 266 498 281 Q 480 300 444 286 Z" />
            </clipPath>

            {/* Right Eye Aperture Clip Path */}
            <clipPath id="heroRightEyeAperture">
              <path d="M 556 308 Q 582 292 610 307 Q 588 322 556 308 Z" />
            </clipPath>

            {/* Warm Iris Gradient (Deep Espresso Brown to Warm Amber) */}
            <radialGradient id="irisGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#120A07" />
              <stop offset="65%" stopColor="#2A160F" />
              <stop offset="85%" stopColor="#6E3A1A" />
              <stop offset="100%" stopColor="#20110B" />
            </radialGradient>

            {/* Upper Sclera Shadow Gradient */}
            <linearGradient id="scleraShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E120D" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#1E120D" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1E120D" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ====================================================== */}
          {/* LEFT EYE (Viewer's Left, Center at 469, 281)           */}
          {/* ====================================================== */}
          <g>
            {/* Sclera & Iris inside Clip Path */}
            <g clipPath="url(#heroLeftEyeAperture)">
              {/* Dynamic Movable Iris & Pupil Group */}
              <motion.g
                style={{
                  x: shouldReduceMotion ? 0 : smoothPupilX,
                  y: shouldReduceMotion ? 0 : smoothPupilY,
                }}
              >
                {/* Deep Warm Brown Iris */}
                <ellipse cx="469" cy="281" rx="13" ry="14" fill="url(#irisGradient)" />

                {/* Warm Amber Rim Highlight */}
                <ellipse cx="469" cy="284.5" rx="9.5" ry="9.5" fill="#D67F33" opacity="0.85" />

                {/* Dark Center Pupil */}
                <ellipse cx="469" cy="281" rx="7.2" ry="7.8" fill="#0C0604" />

                {/* Primary Glossy White Catchlight */}
                <circle cx="474" cy="277" r="3.2" fill="#FFFFFF" />

                {/* Secondary Soft Ambient Reflection */}
                <circle cx="465" cy="284" r="1.6" fill="#FFFFFF" opacity="0.85" />
              </motion.g>

              {/* Upper Eye Depth Shadow */}
              <rect x="440" y="265" width="65" height="15" fill="url(#scleraShadow)" />

              {/* Left Eyelid Blink (Drops down during blink) */}
              <g
                className="transition-transform duration-[120ms] ease-in-out"
                style={{
                  transformOrigin: "470px 270px",
                  transform: isBlinking ? "scaleY(1)" : "scaleY(0)",
                }}
              >
                <path
                  d="M 440 265 L 505 265 L 505 292 Q 472 298 440 292 Z"
                  fill="#E5B79C"
                />
                <path
                  d="M 440 288 Q 470 298 502 288"
                  stroke="#160C0A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            </g>

            {/* Upper Eyeliner & Lashes (Sits in front of moving pupil) */}
            <path
              d="M 440 288 Q 468 268 502 283"
              fill="none"
              stroke="#160C0A"
              strokeWidth="3.8"
              strokeLinecap="round"
            />
            {/* Fine outer lash accents */}
            <path d="M 498 282 L 507 279" stroke="#160C0A" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 495 284 L 505 284" stroke="#160C0A" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* ====================================================== */}
          {/* RIGHT EYE (Viewer's Right, Center at 585, 303)         */}
          {/* ====================================================== */}
          <g>
            {/* Sclera & Iris inside Clip Path */}
            <g clipPath="url(#heroRightEyeAperture)">
              {/* Dynamic Movable Iris & Pupil Group */}
              <motion.g
                style={{
                  x: shouldReduceMotion ? 0 : smoothPupilX,
                  y: shouldReduceMotion ? 0 : smoothPupilY,
                }}
              >
                {/* Deep Warm Brown Iris */}
                <ellipse cx="585" cy="303" rx="12.5" ry="13.5" fill="url(#irisGradient)" />

                {/* Warm Amber Rim Highlight */}
                <ellipse cx="585" cy="306.5" rx="9" ry="9" fill="#D67F33" opacity="0.85" />

                {/* Dark Center Pupil */}
                <ellipse cx="585" cy="303" rx="6.8" ry="7.4" fill="#0C0604" />

                {/* Primary Glossy White Catchlight */}
                <circle cx="589.5" cy="299" r="3.2" fill="#FFFFFF" />

                {/* Secondary Soft Ambient Reflection */}
                <circle cx="581" cy="306" r="1.6" fill="#FFFFFF" opacity="0.85" />
              </motion.g>

              {/* Upper Eye Depth Shadow */}
              <rect x="550" y="285" width="65" height="15" fill="url(#scleraShadow)" />

              {/* Right Eyelid Blink (Drops down during blink) */}
              <g
                className="transition-transform duration-[120ms] ease-in-out"
                style={{
                  transformOrigin: "585px 290px",
                  transform: isBlinking ? "scaleY(1)" : "scaleY(0)",
                }}
              >
                <path
                  d="M 550 285 L 615 285 L 615 314 Q 584 321 550 314 Z"
                  fill="#E5B79C"
                />
                <path
                  d="M 552 310 Q 584 321 612 310"
                  stroke="#160C0A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            </g>

            {/* Upper Eyeliner & Lashes (Sits in front of moving pupil) */}
            <path
              d="M 552 310 Q 582 292 612 308"
              fill="none"
              stroke="#160C0A"
              strokeWidth="3.8"
              strokeLinecap="round"
            />
            {/* Fine outer lash accents */}
            <path d="M 609 307 L 618 304" stroke="#160C0A" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 607 310 L 616 311" stroke="#160C0A" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </svg>

        {/* Hover Cue Tag */}
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#1A110A]/80 text-[#F5F3E7] font-mono text-[10px] tracking-widest uppercase transition-opacity duration-300 pointer-events-none backdrop-blur-sm ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          ✦ Interactive • Click me
        </div>
      </motion.div>
    </div>
  );
}

