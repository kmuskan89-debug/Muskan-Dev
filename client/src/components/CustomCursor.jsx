import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, useReducedMotion } from "framer-motion";

export default function CustomCursor() {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  // Position motion values for 60fps GPU smoothness
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring physics for trailing ring
  const springConfig = { damping: 25, stiffness: 250, mass: 0.2 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Check if device supports fine hover pointer (desktop)
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsTouchDevice(!mediaQuery.matches);

    const handleMediaChange = (e) => {
      setIsTouchDevice(!e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Detect hover over interactive elements
    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive =
        target.closest("a") ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest('[role="button"]') ||
        target.closest("[data-cursor='pointer']");

      setIsHovered(Boolean(isInteractive));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  if (isTouchDevice || shouldReduceMotion) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      {/* Small Precision Dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovered ? 0.4 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
        className="w-2 h-2 rounded-full bg-[#5EEAD4] shadow-[0_0_8px_#5EEAD4]"
      />

      {/* Trailing Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovered ? 1.8 : 1,
          opacity: isVisible ? 1 : 0,
          backgroundColor: isHovered ? "rgba(77, 163, 255, 0.12)" : "rgba(77, 163, 255, 0.0)",
          borderColor: isHovered ? "rgba(94, 234, 212, 0.7)" : "rgba(77, 163, 255, 0.4)",
        }}
        transition={{ duration: 0.2 }}
        className="w-8 h-8 rounded-full border border-[#4DA3FF]/40 backdrop-blur-[1px]"
      />
    </div>
  );
}

