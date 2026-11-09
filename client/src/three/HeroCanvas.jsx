import React, { useRef, useEffect, useState, memo } from "react";
import { Canvas } from "@react-three/fiber";
import RobotGirl from "./RobotGirl";

/**
 * Flat SVG Robot Face Fallback for low-power devices.
 * Matches the 3D robot girl in colors, features, and cute interactive click bounce.
 */
function FlatRobotGirl({ onClick }) {
  const [isHappy, setIsHappy] = useState(false);

  const handleClick = (e) => {
    setIsHappy(true);
    setTimeout(() => setIsHappy(false), 800);
    onClick?.(e);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Interactive robot girl illustration"
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none group"
    >
      <svg
        viewBox="0 0 280 320"
        className={`w-full h-full max-w-[340px] max-h-[380px] drop-shadow-lg transition-transform duration-300 ${
          isHappy ? "-translate-y-3 scale-105" : "hover:-translate-y-1"
        }`}
      >
        {/* Soft Orange Glow Behind Her */}
        <circle cx="140" cy="160" r="120" fill="#F79F15" opacity="0.2" />

        {/* Soft Ground Shadow */}
        <ellipse cx="140" cy="300" rx="90" ry="14" fill="#1A110A" opacity="0.12" />

        {/* Torso & Shoulders */}
        <ellipse cx="140" cy="275" rx="68" ry="45" fill="#FFFFFF" stroke="#1A110A" strokeWidth="2.5" />
        <ellipse cx="80" cy="285" rx="22" ry="22" fill="#FFFFFF" stroke="#1A110A" strokeWidth="2" />
        <ellipse cx="200" cy="285" rx="22" ry="22" fill="#FFFFFF" stroke="#1A110A" strokeWidth="2" />

        {/* Neck */}
        <rect x="122" y="215" width="36" height="24" rx="4" fill="#1A110A" />
        <rect x="120" y="222" width="40" height="7" rx="3.5" fill="#F79F15" />

        {/* Antenna */}
        <rect x="137" y="55" width="6" height="35" rx="3" fill="#1A110A" />
        <circle cx="140" cy="50" r="14" fill="#F79F15" filter="drop-shadow(0 0 6px rgba(247,159,21,0.8))" />

        {/* Hair Buns & Orange Ties */}
        {/* Left Bun */}
        <circle cx="68" cy="115" r="30" fill="#1A110A" />
        <ellipse cx="78" cy="130" rx="14" ry="7" fill="#F79F15" />
        {/* Right Bun */}
        <circle cx="212" cy="115" r="30" fill="#1A110A" />
        <ellipse cx="202" cy="130" rx="14" ry="7" fill="#F79F15" />

        {/* Head Base (White Glossy) */}
        <ellipse cx="140" cy="155" rx="76" ry="70" fill="#FFFFFF" stroke="#1A110A" strokeWidth="3" />

        {/* Hair Cap on Top of Head */}
        <path d="M 66 145 C 66 85, 214 85, 214 145 Z" fill="#1A110A" />

        {/* Ears */}
        <rect x="56" y="142" width="12" height="28" rx="6" fill="#FFFFFF" stroke="#1A110A" strokeWidth="2" />
        <rect x="58" y="148" width="8" height="16" rx="4" fill="#F79F15" />
        <rect x="212" y="142" width="12" height="28" rx="6" fill="#FFFFFF" stroke="#1A110A" strokeWidth="2" />
        <rect x="214" y="148" width="8" height="16" rx="4" fill="#F79F15" />

        {/* Face Visor Plate (Ink) */}
        <ellipse cx="140" cy="165" rx="58" ry="44" fill="#1A110A" />

        {/* Blush Cheeks */}
        <circle cx="100" cy="184" r="8" fill="#F79F15" opacity="0.65" />
        <circle cx="180" cy="184" r="8" fill="#F79F15" opacity="0.65" />

        {/* Eyes (Glowing Orange) */}
        {isHappy ? (
          /* Happy "^ ^" Eyes */
          <g stroke="#F79F15" strokeWidth="4" strokeLinecap="round" fill="none">
            <path d="M 108 168 L 116 160 L 124 168" />
            <path d="M 156 168 L 164 160 L 172 168" />
          </g>
        ) : (
          /* Round Orange Glowing Eyes with Catchlight */
          <g>
            <circle cx="116" cy="164" r="13" fill="#F79F15" filter="drop-shadow(0 0 5px rgba(247,159,21,0.8))" />
            <circle cx="120" cy="160" r="4.5" fill="#FFFFFF" />
            <circle cx="164" cy="164" r="13" fill="#F79F15" filter="drop-shadow(0 0 5px rgba(247,159,21,0.8))" />
            <circle cx="168" cy="160" r="4.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Tiny Smile */}
        <path d="M 134 184 Q 140 190 146 184" stroke="#F79F15" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/**
 * Hero Canvas:
 * - Lazy-loaded React Three Fiber Canvas with RobotGirl.
 * - Hardware / low-power detection with fallback to flat SVG.
 * - Pauses rendering when hero is off-screen or tab is hidden.
 */
function HeroCanvas({ isVisible = true, shouldReduceMotion = false }) {
  const containerRef = useRef(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const [isLowPowerFallback, setIsLowPowerFallback] = useState(false);

  useEffect(() => {
    // Detect low-power or low-core hardware
    const checkHardware = () => {
      const isLowCore =
        typeof navigator !== "undefined" &&
        navigator.hardwareConcurrency &&
        navigator.hardwareConcurrency <= 2;
      const isSmallMobile = window.innerWidth < 480;
      setIsLowPowerFallback(isLowCore && isSmallMobile);
    };

    checkHardware();
    window.addEventListener("resize", checkHardware);

    // Track tab visibility to pause rendering when backgrounded
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("resize", checkHardware);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Low-power fallback renders crisp flat SVG robot face
  if (isLowPowerFallback) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <FlatRobotGirl />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative pointer-events-auto"
      style={{ touchAction: "none" }}
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.45, 4.4], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={isVisible && isTabActive ? "always" : "never"}
      >
        {/* Hemisphere ambient light for soft fill */}
        <hemisphereLight skyColor="#FFFFFF" groundColor="#F5F3E7" intensity={0.9} />

        {/* Directional key light */}
        <directionalLight position={[4, 5, 5]} intensity={1.6} color="#FFFFFF" />

        {/* Directional fill light */}
        <directionalLight position={[-4, 2, 4]} intensity={0.5} color="#F5F3E7" />

        {/* Orange rim lights for edge glow */}
        <pointLight position={[3.2, 2.5, -1.8]} intensity={2.5} color="#F79F15" />
        <pointLight position={[-3.2, 1.8, -1.8]} intensity={1.8} color="#F79F15" />

        {/* Robot Girl 3D Assembly */}
        <RobotGirl
          shouldReduceMotion={shouldReduceMotion}
          isTabActive={isTabActive}
        />
      </Canvas>
    </div>
  );
}

export default memo(HeroCanvas);
