import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

export default function AboutPhotoCard() {
  const cardRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Motion values for tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 3D rotation
  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="relative flex items-center justify-center py-6">
      {/* Ambient background glow behind portrait */}
      <div className="absolute w-72 h-80 bg-[#4DA3FF]/20 rounded-full blur-[90px] pointer-events-none" />

      {/* Floating Wrapper */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                y: [-7, 7, -7],
              }
        }
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
        }}
        className="relative"
        style={{ perspective: 1000 }}
      >
        {/* 3D Tilting Card Container */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={
            isMobile || shouldReduceMotion
              ? {}
              : {
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }
          }
          className="relative w-72 sm:w-80 h-96 sm:h-[420px] rounded-3xl p-[2px] bg-gradient-to-br from-[#4DA3FF] via-[#5EEAD4]/60 to-[#4DA3FF]/20 shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(77,163,255,0.25)] transition-shadow duration-300 group"
        >
          {/* Inner Photo Container */}
          <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#0E1626] relative">
            <img
              src="/me.png"
              alt="Muskan Kumari"
              className="w-full h-full object-cover object-[center_20%] transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Subtle Gradient Overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060B16] via-transparent to-transparent opacity-60 pointer-events-none" />

            {/* Corner Badge */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-[#E8EDF3] bg-[#0E1626]/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
              <span className="text-[#5EEAD4] font-semibold">Muskan Kumari</span>
              <span className="text-[#8A97AB]">BTech CSE '28</span>
            </div>
          </div>
        </motion.div>

        {/* Floating Glass Chip 1: MERN (Top Right) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [-5, 5, -5],
                }
          }
          transition={{
            repeat: Infinity,
            duration: 4.2,
            ease: "easeInOut",
          }}
          className="absolute -top-3 -right-4 sm:-right-6 glass-card px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono font-semibold text-[#5EEAD4] border border-[#5EEAD4]/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] pointer-events-none z-10"
        >
          <span className="w-2 h-2 rounded-full bg-[#5EEAD4] shadow-[0_0_8px_#5EEAD4]" />
          <span>MERN</span>
        </motion.div>

        {/* Floating Glass Chip 2: DSA (Bottom Left) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [6, -6, 6],
                }
          }
          transition={{
            repeat: Infinity,
            duration: 5.5,
            ease: "easeInOut",
          }}
          className="absolute bottom-16 -left-4 sm:-left-6 glass-card px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono font-semibold text-[#4DA3FF] border border-[#4DA3FF]/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] pointer-events-none z-10"
        >
          <span className="w-2 h-2 rounded-full bg-[#4DA3FF] shadow-[0_0_8px_#4DA3FF]" />
          <span>DSA</span>
        </motion.div>

        {/* Floating Glass Chip 3: AI/ML (Bottom Right) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [-6, 6, -6],
                }
          }
          transition={{
            repeat: Infinity,
            duration: 3.8,
            ease: "easeInOut",
          }}
          className="absolute -bottom-4 right-6 glass-card px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono font-semibold text-[#E8EDF3] border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)] pointer-events-none z-10"
        >
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#4DA3FF] to-[#5EEAD4] shadow-[0_0_8px_#5EEAD4]" />
          <span>AI / ML</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

