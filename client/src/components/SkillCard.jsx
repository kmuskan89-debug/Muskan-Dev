import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

export default function SkillCard({ name, category, icon: Icon, accentColor = "#4DA3FF" }) {
  const cardRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  // Mouse tilt motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Coordinates for the cursor-following glow (in pixels relative to card)
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);

  // Smooth springs for tilt
  const springConfig = { damping: 20, stiffness: 220 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsTouchDevice(!mediaQuery.matches);

    const handleChange = (e) => setIsTouchDevice(!e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleMouseMove = (e) => {
    if (isTouchDevice || shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    // Normalized (-0.5 to 0.5) for tilt
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);

    // Pixel coordinates for cursor glow
    glowX.set(e.clientX - rect.left);
    glowY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        isTouchDevice || shouldReduceMotion
          ? {}
          : {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }
      }
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative glass-card rounded-2xl p-5 flex flex-col justify-between gap-4 border border-white/5 hover:border-[#4DA3FF]/40 transition-colors duration-300 overflow-hidden select-none"
    >
      {/* Cursor-Following Radial Glow (Desktop) */}
      {!isTouchDevice && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 -z-10"
          style={{
            opacity: isHovered ? 0.35 : 0,
            background: `radial-gradient(180px circle at ${glowX.get()}px ${glowY.get()}px, rgba(77, 163, 255, 0.25), transparent 80%)`,
          }}
        />
      )}

      {/* Top: Icon & Category Indicator */}
      <div className="flex items-center justify-between w-full">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#060B16]/80 border border-white/10 group-hover:border-[#4DA3FF]/50 transition-colors duration-300 shadow-inner"
          style={{ color: accentColor }}
        >
          {Icon ? <Icon className="text-2xl transition-transform duration-300 group-hover:scale-110" /> : null}
        </div>

        {/* Category Label in small mono font */}
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#8A97AB] group-hover:text-[#5EEAD4] transition-colors">
          {category}
        </span>
      </div>

      {/* Bottom: Skill Name */}
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base sm:text-lg font-bold text-[#E8EDF3] group-hover:text-white transition-colors tracking-tight">
          {name}
        </h3>
      </div>
    </motion.div>
  );
}

