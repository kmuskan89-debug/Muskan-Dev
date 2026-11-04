import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
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
        <color attach="background" args={["#060B16"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#4DA3FF" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#5EEAD4" />

        <CameraScrollController />

        <NeuralNetwork count={120} isMobile={isMobileOrLowPower} />

        {/* Subtle, non-intrusive bloom for glowing effect without washing out text */}
        {!isMobileOrLowPower && (
          <EffectComposer multisampling={0} disableNormalPass>
            <Bloom
              luminanceThreshold={0.25}
              luminanceSmoothing={0.9}
              intensity={0.45}
              levels={4}
            />
          </EffectComposer>
        )}
      </Canvas>

      {/* Radial vignette overlay to keep foreground text extremely legible */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,#060B16_90%] opacity-75 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060B16]/40 via-transparent to-[#060B16] pointer-events-none" />
    </div>
  );
}

