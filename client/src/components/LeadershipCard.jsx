import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { FiUsers } from "react-icons/fi";

export default function LeadershipCard({
  role = "Engagement Lead",
  organization = "GDGC SVIET",
  icon: Icon = FiUsers,
  accentColor = "#5EEAD4",
}) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  // Mouse tilt motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  // Touch device detection to strictly disable tilt on mobile/tablets
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
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);

    glowX.set(e.clientX - rect.left);
    glowY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
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
      className="group relative glass-card rounded-3xl p-5 sm:p-8 flex items-center justify-between border border-white/10 hover:border-[#5EEAD4]/40 transition-colors duration-300 overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.5)] select-none"
    >
      {/* Cursor-Following Radial Glow (Desktop only) */}
      {!isTouchDevice && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 -z-10"
          style={{
            opacity: isHovered ? 0.35 : 0,
            background: `radial-gradient(280px circle at ${glowX.get()}px ${glowY.get()}px, rgba(94, 234, 212, 0.25), transparent 75%)`,
          }}
        />
      )}

      {/* Left Icon + Content */}
      <div className="flex items-center gap-3.5 sm:gap-6 min-w-0 flex-1">
        <div
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-[#060B16]/80 border border-white/10 group-hover:border-[#5EEAD4]/40 transition-colors duration-300 shadow-inner shrink-0"
          style={{ color: accentColor }}
        >
          <Icon className="text-xl sm:text-3xl transition-transform duration-300 group-hover:scale-110" />
        </div>

        <div className="flex flex-col min-w-0">
          <h4 className="text-base sm:text-2xl font-bold font-heading text-[#E8EDF3] group-hover:text-white transition-colors leading-tight">
            {role}
          </h4>
          <p className="text-xs sm:text-sm font-mono text-[#8A97AB] mt-0.5 sm:mt-1">
            {organization}
          </p>
        </div>
      </div>

      {/* Right Accent Light Indicator */}
      <div
        className="w-2.5 h-2.5 rounded-full ml-3 sm:ml-4 shrink-0"
        style={{
          backgroundColor: accentColor,
          boxShadow: `0 0 10px ${accentColor}`,
        }}
      />
    </motion.div>
  );
}
