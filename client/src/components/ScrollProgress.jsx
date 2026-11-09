import React from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#F79F15] origin-left z-[100] shadow-[0_0_10px_rgba(247,159,21,0.5)] pointer-events-none"
    />
  );
}

