import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";

function RotatingGeometry() {
  const meshRef = useRef();
  const innerRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.45;
      meshRef.current.rotation.y += delta * 0.65;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.55;
      innerRef.current.rotation.z += delta * 0.4;
    }
  });

  return (
    <group>
      {/* Outer Torus Knot in Electric Blue Wireframe */}
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.0, 0.28, 80, 14]} />
        <meshBasicMaterial
          color="#4DA3FF"
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Inner Glowing Cyan Icosahedron */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.65, 0]} />
        <meshBasicMaterial
          color="#5EEAD4"
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

export default function AIExploringCanvas({ isVisible = true }) {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Static high-performance fallback on mobile or reduced-motion
  if (isMobile || shouldReduceMotion) {
    return (
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#4DA3FF]/20 to-[#5EEAD4]/20 border border-[#5EEAD4]/30 shadow-[0_0_20px_rgba(94,234,212,0.2)]">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#5EEAD4] animate-spin flex items-center justify-center [animation-duration:12s]">
          <div className="w-4 h-4 rounded-full bg-[#4DA3FF] shadow-[0_0_10px_#4DA3FF]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-28 h-28 sm:w-36 sm:h-36 relative shrink-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        frameloop={isVisible ? "always" : "never"}
      >
        <ambientLight intensity={0.6} />
        <RotatingGeometry />
      </Canvas>
    </div>
  );
}

