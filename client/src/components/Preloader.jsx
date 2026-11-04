import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function Preloader({ onComplete }) {
  const shouldReduceMotion = useReducedMotion();
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsDone(true);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setIsDone(true);
      setTimeout(() => {
        onComplete?.();
      }, 500); // Allow exit animation to complete
    }, 1200);

    return () => clearTimeout(timer);
  }, [shouldReduceMotion, onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -30,
            filter: "blur(10px)",
            transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
          }}
          aria-hidden="true"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#060B16]"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-[#4DA3FF]/15 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col items-center gap-6">
            {/* MK Monogram SVG with stroke drawing animation */}
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_15px_rgba(77,163,255,0.6)]"
            >
              {/* Outer Decorative Hexagon / Frame */}
              <motion.polygon
                points="50,5 90,28 90,72 50,95 10,72 10,28"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />

              {/* Letter M Path */}
              <motion.path
                d="M26 66 V34 L40 50 L50 38"
                stroke="url(#gradient-accent)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.85, ease: "easeInOut", delay: 0.1 }}
              />

              {/* Letter K Path */}
              <motion.path
                d="M56 34 V66 M72 34 L56 50 L73 66"
                stroke="url(#gradient-accent)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.85, ease: "easeInOut", delay: 0.2 }}
              />

              <defs>
                <linearGradient
                  id="gradient-accent"
                  x1="26"
                  y1="34"
                  x2="73"
                  y2="66"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4DA3FF" />
                  <stop offset="1" stopColor="#5EEAD4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Subtitle / Status indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="section-label text-xs tracking-[0.25em]"
            >
              MUSKAN KUMARI
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

