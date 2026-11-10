import React, { useRef, useState } from "react";
import { motion, useMotionValue, useMotionTemplate, useReducedMotion } from "framer-motion";
import { useLenis } from "./SmoothScroll";
import { FiCpu, FiCode, FiLayers, FiArrowDownRight } from "react-icons/fi";

/**
 * Interactive Focus & Blueprint Spotlight Bridge:
 * Sits cleanly between Academic Journey and Skills.
 * - Replaces the old text marquee with 3 interactive, expandable engineering pillars
 *   grounded in real data from content.js (DSA, MERN Stack, AI/ML Exploration).
 * - Cursor movement projects a glowing orange blueprint grid spotlight across the strip.
 * - Hovering or tapping a pillar expands it smoothly; clicking scrolls directly to #skills.
 */
const PILLARS = [
  {
    id: "dsa",
    num: "01",
    tag: "CORE FOUNDATIONS",
    title: "DSA & Problem Solving",
    detail: "100+ DSA problems on LeetCode with strong OOPs fundamentals.",
    icon: FiCode,
  },
  {
    id: "mern",
    num: "02",
    tag: "FULL-STACK CRAFT",
    title: "MERN Stack Engineering",
    detail: "End-to-end scalable web apps using React, Node.js, Express & MongoDB.",
    icon: FiLayers,
  },
  {
    id: "aiml",
    num: "03",
    tag: "ACTIVE EXPLORATION",
    title: "AI & Machine Learning",
    detail: "Currently learning AI / ML alongside modern full-stack web development.",
    icon: FiCpu,
  },
];

export default function MarqueeStrip() {
  const containerRef = useRef(null);
  const [activeId, setActiveId] = useState("mern");
  const shouldReduceMotion = useReducedMotion();
  const lenis = useLenis();

  // Cursor spotlight coordinates relative to the strip
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);

  const spotlightMask = useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 78%)`;
  const spotlightGlow = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, rgba(247, 159, 21, 0.16) 0%, transparent 72%)`;

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(-400);
    mouseY.set(-400);
  };

  const handleJumpToSkills = () => {
    if (lenis) {
      lenis.scrollTo("#skills", { offset: -96, duration: 0.9 });
    } else {
      document.querySelector("#skills")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 max-w-6xl mx-auto my-2">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full rounded-[28px] bg-[#1A110A] border border-[#1A110A] overflow-hidden shadow-xl"
      >
        {/* Subtle Base Dot Grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(245, 243, 231, 0.35) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Cursor-Revealed Orange Blueprint Grid Overlay */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(247, 159, 21, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(247, 159, 21, 0.22) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                WebkitMaskImage: spotlightMask,
                maskImage: spotlightMask,
              }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{ background: spotlightGlow }}
            />
          </>
        )}

        {/* Top Micro Header Bar */}
        <div className="relative z-10 flex items-center justify-between px-5 sm:px-7 py-3 border-b border-[#F5F3E7]/10">
          <span className="font-mono text-[10px] sm:text-xs font-bold tracking-[0.22em] text-[#F79F15] uppercase">
            // HOW I BUILD
          </span>
          <span className="font-mono text-[10px] text-[#9F9B90] uppercase tracking-wider hidden sm:inline">
            Hover to inspect • Click to jump to skills ↓
          </span>
        </div>

        {/* 3 Interactive Expandable Pillars */}
        <div className="relative z-10 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#F5F3E7]/10">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isActive = activeId === pillar.id;

            return (
              <motion.button
                key={pillar.id}
                type="button"
                layout={!shouldReduceMotion}
                onMouseEnter={() => setActiveId(pillar.id)}
                onFocus={() => setActiveId(pillar.id)}
                onClick={() => {
                  setActiveId(pillar.id);
                  handleJumpToSkills();
                }}
                style={{ flex: isActive ? 1.55 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className={`group relative text-left px-5 sm:px-7 py-5 sm:py-6 transition-colors duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F79F15] focus-visible:outline-offset-[-2px] ${
                  isActive ? "bg-[#F5F3E7]/[0.04]" : "bg-transparent hover:bg-[#F5F3E7]/[0.02]"
                }`}
              >
                {/* Top Active Orange Accent Line */}
                <span
                  aria-hidden="true"
                  className={`absolute top-0 left-0 right-0 h-[2.5px] bg-[#F79F15] transition-transform duration-300 origin-left ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border transition-colors ${
                        isActive
                          ? "bg-[#F79F15] text-[#1A110A] border-[#F79F15]"
                          : "bg-transparent text-[#9F9B90] border-[#F5F3E7]/15"
                      }`}
                    >
                      {pillar.num}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.18em] text-[#9F9B90] uppercase">
                      {pillar.tag}
                    </span>
                  </div>

                  <div
                    className={`p-2 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? "bg-[#F79F15]/15 border-[#F79F15]/40 text-[#F79F15]"
                        : "bg-[#F5F3E7]/5 border-[#F5F3E7]/10 text-[#9F9B90]"
                    }`}
                  >
                    <Icon className="text-base" />
                  </div>
                </div>

                <h3
                  className={`font-heading font-bold text-lg sm:text-xl tracking-tight transition-colors duration-200 ${
                    isActive ? "text-[#FFFFFF]" : "text-[#F5F3E7]/80"
                  }`}
                >
                  {pillar.title}
                </h3>

                <p
                  className={`mt-1.5 text-xs sm:text-sm leading-relaxed transition-colors duration-200 ${
                    isActive ? "text-[#F5F3E7]/85" : "text-[#9F9B90]"
                  }`}
                >
                  {pillar.detail}
                </p>

                {/* Subtle Action Cue on Active Pillar */}
                <div
                  className={`mt-3 inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? "text-[#F79F15] opacity-100 translate-y-0"
                      : "text-[#9F9B90] opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                >
                  <span>Explore Skills</span>
                  <FiArrowDownRight className="text-sm transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
