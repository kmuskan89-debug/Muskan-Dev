import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import NeuralNetwork from "./NeuralNetwork";

function CameraScrollController() {
  const { camera } = useThree();

  useFrame(() => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const heroHeight = window.innerHeight || 800;
    const progress = Math.min(Math.max(scrollY / heroHeight, 0), 1.5);

    // Smoothly pull back camera as user scrolls down
    camera.position.z = 6.0 + progress * 3.2;
    camera.position.y = -progress * 0.8;
  });

  return null;
}

export default function HeroCanvas({ isVisible = true }) {
  const containerRef = useRef(null);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [isMobileOrLowPower, setIsMobileOrLowPower] = useState(false);

  useEffect(() => {
    // Check mobile or low-power hardware
    const checkSpecs = () => {
      const isMobile = window.innerWidth < 768;
      const isLowCore =
        typeof navigator !== "undefined" &&
        navigator.hardwareConcurrency &&
        navigator.hardwareConcurrency <= 4;
      setIsMobileOrLowPower(isMobile || isLowCore);
    };

    checkSpecs();
    window.addEventListener("resize", checkSpecs);

    // Scroll fade out
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const heroHeight = window.innerHeight || 800;
      const opacity = Math.max(0, 1 - (scrollY / heroHeight) * 1.25);
      setScrollOpacity(opacity);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", checkSpecs);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ opacity: scrollOpacity }}
      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
    >
      <Canvas
        dpr={[1, 1.75]} // Clamped DPR for crisp rendering without GPU overload
        camera={{ position: [0, 0, 6.0], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={isVisible ? "always" : "never"} // Pause rendering when off-screen
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#F79F15" />
        <pointLight position={[-10, -10, -10]} intensity={1.0} color="#1A110A" />

        <CameraScrollController />

        <NeuralNetwork count={120} isMobile={isMobileOrLowPower} />
      </Canvas>

      {/* Subtle vignette overlay in cream tone */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,#F5F3E7_90%] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F3E7]/40 via-transparent to-[#F5F3E7] pointer-events-none" />
    </div>
  );
}
