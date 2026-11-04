import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const PHRASE = "MERN STACK ✦ DSA ✦ AI/ML ✦ PROBLEM SOLVING ✦ ";

export default function MarqueeStrip() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { margin: "100px 0px" });
  const shouldReduceMotion = useReducedMotion();

  // Repeated phrase to fill screen widths seamlessly
  const repeatedText = (PHRASE + " ").repeat(4);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-10 my-12 pointer-events-none select-none"
    >
      {/* -2 degree rotation wrapper */}
      <div className="transform -rotate-2 -mx-10 scale-105 flex flex-col gap-3">
        {/* Row 1: Leftward Scrolling */}
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap"
            animate={
              isInView && !shouldReduceMotion
                ? { x: ["0%", "-50%"] }
                : { x: "0%" }
            }
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 28,
            }}
          >
            <span className="text-4xl md:text-6xl font-black font-heading tracking-widest text-transparent uppercase [-webkit-text-stroke:1.5px_rgba(232,237,243,0.18)] pr-6">
              {repeatedText}
            </span>
            <span className="text-4xl md:text-6xl font-black font-heading tracking-widest text-transparent uppercase [-webkit-text-stroke:1.5px_rgba(232,237,243,0.18)] pr-6">
              {repeatedText}
            </span>
          </motion.div>
        </div>

        {/* Row 2: Rightward Scrolling */}
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap"
            animate={
              isInView && !shouldReduceMotion
                ? { x: ["-50%", "0%"] }
                : { x: "-50%" }
            }
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 28,
            }}
          >
            <span className="text-4xl md:text-6xl font-black font-heading tracking-widest text-transparent uppercase [-webkit-text-stroke:1.5px_rgba(77,163,255,0.22)] pr-6">
              {repeatedText}
            </span>
            <span className="text-4xl md:text-6xl font-black font-heading tracking-widest text-transparent uppercase [-webkit-text-stroke:1.5px_rgba(77,163,255,0.22)] pr-6">
              {repeatedText}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Subtle edge fade overlays */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#060B16] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#060B16] to-transparent pointer-events-none" />
    </div>
  );
}

