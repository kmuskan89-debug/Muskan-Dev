import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLenis } from "../components/SmoothScroll";
import Magnetic from "../components/Magnetic";
import Typewriter from "../components/Typewriter";
import { personalInfo, achievements } from "../data/content";
import { FiArrowRight, FiDownload, FiArrowDown, FiGithub, FiLinkedin } from "react-icons/fi";
import { SiLeetcode } from "react-icons/si";

import HeroCharacter from "../components/HeroCharacter";

// Rotating circular sticker "SEEKING SDE ROLES - "
function CircularSticker() {
  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center select-none shrink-0 text-[#1A110A]">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full animate-[spin_14s_linear_infinite]"
        style={{ transformOrigin: "center center" }}
      >
        <path
          id="heroCircularTextPath"
          d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          fill="none"
        />
        <text className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] fill-current">
          <textPath href="#heroCircularTextPath">
            SEEKING SDE ROLES • SEEKING SDE ROLES •{" "}
          </textPath>
        </text>
      </svg>
      {/* Center Orange Star Accent */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F79F15] text-[#1A110A] flex items-center justify-center font-bold text-xs shadow-sm">
          ✦
        </div>
      </div>
    </div>
  );
}

export default function Hero({ preloaderComplete = true }) {
  const heroRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const lenis = useLenis();
  const shouldReduceMotion = useReducedMotion();

  // Pause R3F when hero is off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleScrollToProjects = useCallback(
    (e) => {
      e?.preventDefault?.();
      if (lenis) {
        lenis.scrollTo("#projects", { offset: -116, duration: 1.2 });
      } else {
        document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [lenis]
  );

  const handleScrollToAbout = useCallback(() => {
    if (lenis) {
      lenis.scrollTo("#about", { offset: -116, duration: 1.2 });
    } else {
      document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [lenis]);

  // Real facts derived from content.js
  const fact1 = achievements?.[0]?.includes("100+")
    ? "100+ DSA problems on LeetCode"
    : achievements?.[0] || "100+ DSA problems on LeetCode";

  const fact2 = achievements?.[1]?.includes("Google Ideate")
    ? "1st Runner Up, Google Ideate"
    : achievements?.[1] || "1st Runner Up, Google Ideate";

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 sm:px-6 md:px-8 pt-24 sm:pt-28 pb-6 sm:pb-8 overflow-hidden bg-[#F5F3E7]"
    >
      {/* Subtle ambient warm glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#F79F15]/8 rounded-full blur-[140px] pointer-events-none" />

      {/* ======================================================== */}
      {/* 1. TOP STATUS BAR (Status pill, Intro label & Sticker)   */}
      {/* ======================================================== */}
      <div className="relative z-20 w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#1A110A] uppercase">
            // 01. INTRO
          </span>
          <span className="text-[#9F9B90]">•</span>
          {/* Availability Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-[#FFFFFF] text-[#1A110A] border border-[#1A110A]/15 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F79F15] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F79F15]" />
            </span>
            <span className="font-semibold">Open to opportunities</span>
          </div>
        </div>

        {/* Rotating Circular Sticker */}
        <CircularSticker />
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN HERO STAGE                                       */}
      {/* Desktop: Left (Headline/Buttons/Socials), Center (Robot), */}
      {/*          Right (Roles/Fact chips/Scroll)                 */}
      {/* Mobile: Robot on Top, then Content Centered              */}
      {/* ======================================================== */}
      <div className="relative z-20 w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 my-auto min-h-[520px]">
        {/* ====================================================== */}
        {/* MOBILE CHARACTER CONTAINER (Rendered above text)       */}
        {/* ====================================================== */}
        <div className="lg:hidden w-full flex justify-center -mb-3 mt-2">
          <HeroCharacter className="w-[280px] sm:w-[320px] max-w-[85vw]" />
        </div>

        {/* ====================================================== */}
        {/* LEFT COLUMN: Name, Pitch, Action Buttons, Socials      */}
        {/* ====================================================== */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5 max-w-lg z-20 lg:pb-12"
        >
          {/* Headline with Bricolage Grotesque 800 */}
          <h1 className="font-heading font-black tracking-tight leading-[1.02] text-[#1A110A] text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl">
            I'm <br className="hidden lg:block" />
            <span className="text-[#F79F15]">Muskan Kumari</span>
          </h1>

          {/* Career Objective Pitch */}
          <p className="text-[#6F6B60] text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
            {personalInfo.objective}
          </p>

          {/* Two Pill Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mt-1">
            <Magnetic strength={0.35}>
              <a
                href="#projects"
                onClick={handleScrollToProjects}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 min-h-[44px] rounded-full text-xs sm:text-sm font-bold bg-[#F79F15] text-[#1A110A] hover:bg-[#1A110A] hover:text-[#F5F3E7] shadow-md transition-all font-mono group"
              >
                <span>View My Work</span>
                <FiArrowRight className="transition-transform group-hover:translate-x-1 text-sm sm:text-base shrink-0" />
              </a>
            </Magnetic>

            <Magnetic strength={0.35}>
              <a
                href={personalInfo.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 min-h-[44px] rounded-full text-xs sm:text-sm font-semibold border border-[#1A110A] bg-[#FFFFFF] hover:bg-[#F8F5EE] text-[#1A110A] shadow-sm transition-all font-mono"
              >
                <span>Download Resume</span>
                <FiDownload className="text-[#F79F15] text-sm sm:text-base shrink-0" />
              </a>
            </Magnetic>
          </div>

          {/* Follow Me On Social Links (Desktop Left) */}
          <div className="flex items-center gap-3 pt-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#6F6B60]">
              Follow me on:
            </span>
            <div className="flex items-center gap-2">
              <Magnetic strength={0.3}>
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Muskan Kumari's GitHub profile"
                  className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#1A110A]/15 text-[#1A110A] hover:border-[#F79F15] hover:text-[#F79F15] shadow-sm flex items-center justify-center transition-all"
                >
                  <FiGithub className="text-sm" />
                </a>
              </Magnetic>

              <Magnetic strength={0.3}>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Muskan Kumari's LinkedIn profile"
                  className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#1A110A]/15 text-[#1A110A] hover:border-[#F79F15] hover:text-[#F79F15] shadow-sm flex items-center justify-center transition-all"
                >
                  <FiLinkedin className="text-sm" />
                </a>
              </Magnetic>

              <Magnetic strength={0.3}>
                <a
                  href={personalInfo.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Muskan Kumari's LeetCode profile"
                  className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#1A110A]/15 text-[#1A110A] hover:border-[#F79F15] hover:text-[#F79F15] shadow-sm flex items-center justify-center transition-all"
                >
                  <SiLeetcode className="text-sm" />
                </a>
              </Magnetic>
            </div>
          </div>
        </motion.div>

        {/* ====================================================== */}
        {/* DESKTOP CENTER-BOTTOM: Illustrated Character (Cropped) */}
        {/* ====================================================== */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 bottom-[-40px] xl:bottom-[-50px] w-[420px] xl:w-[480px] 2xl:w-[530px] pointer-events-auto z-10">
          <HeroCharacter className="w-full" />
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: Roles, Fact Chips & Scroll Cue           */}
        {/* ====================================================== */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="flex flex-col items-center lg:items-end text-center lg:text-right gap-6 max-w-sm z-20 lg:pb-12"
        >
          {/* Roles Block with Typewriter */}
          <div className="flex flex-col items-center lg:items-end gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-[#9F9B90]">
              // Current Roles
            </span>
            <div className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight text-[#1A110A]">
              <span>I build as a </span>
              <Typewriter
                words={["MERN Stack Developer", "DSA Enthusiast", "AI/ML Learner"]}
                typingSpeed={85}
                deletingSpeed={40}
                pauseDuration={2000}
              />
            </div>
          </div>

          {/* Two Real Facts Chips */}
          <div className="flex flex-col items-center lg:items-end gap-2.5 w-full">
            <div className="px-4 py-2 rounded-full text-xs font-mono font-medium flex items-center gap-2 bg-[#FFFFFF] border border-[#1A110A]/15 text-[#1A110A] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15] shrink-0" />
              <span className="truncate max-w-[240px]">{fact1}</span>
            </div>

            <div className="px-4 py-2 rounded-full text-xs font-mono font-medium flex items-center gap-2 bg-[#FFFFFF] border border-[#1A110A]/15 text-[#1A110A] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15] shrink-0" />
              <span className="truncate max-w-[240px]">{fact2}</span>
            </div>
          </div>

          {/* Scroll down cue */}
          <button
            type="button"
            onClick={handleScrollToAbout}
            aria-label="Scroll to explore about section"
            className="flex flex-col items-center lg:items-end gap-1.5 cursor-pointer group pt-2 min-h-[44px] justify-center"
          >
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-[#6F6B60] group-hover:text-[#F79F15] transition-colors">
              Scroll to explore
            </span>
            <div className="text-[#1A110A] group-hover:text-[#F79F15] transition-transform duration-300 group-hover:translate-y-1">
              <FiArrowDown size={14} />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
