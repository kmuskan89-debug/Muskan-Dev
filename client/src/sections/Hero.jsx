import React, { lazy, Suspense, useRef, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLenis } from "../components/SmoothScroll";
import Magnetic from "../components/Magnetic";
import Typewriter from "../components/Typewriter";
import { personalInfo } from "../data/content";
import { FiArrowDown, FiDownload, FiArrowRight } from "react-icons/fi";

// Lazy-loaded R3F Canvas background with Suspense fallback
const HeroCanvas = lazy(() => import("../three/HeroCanvas"));

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

  const handleScrollToProjects = (e) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo("#projects", { offset: -116, duration: 1.2 });
    } else {
      document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollDown = () => {
    if (lenis) {
      lenis.scrollTo("#about", { offset: -116, duration: 1.2 });
    } else {
      document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Letter reveal animation variants
  const nameString = personalInfo.name || "Muskan Kumari";
  const nameLetters = Array.from(nameString);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.045,
        delayChildren: shouldReduceMotion ? 0 : 0.2,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 120,
      },
    },
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-screen w-full flex flex-col justify-center items-center px-6 overflow-hidden bg-[#F5F3E7]"
    >
      {/* 1. React Three Fiber Canvas Background (Decorative) */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-[#F5F3E7] pointer-events-none" />
          }
        >
          <HeroCanvas isVisible={isVisible} />
        </Suspense>
      </div>

      {/* 2. Foreground Content Container */}
      <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center text-center gap-7 pt-28 sm:pt-32">
        
        {/* Top Badges Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {/* Small Mono Label */}
          <div className="section-label text-xs tracking-[0.2em]">
            // HELLO, WORLD
          </div>

          <span className="text-[#9F9B90]">•</span>

          {/* Availability Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#2E7D32]/30 text-xs font-mono text-[#2E7D32] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D32]" />
            </span>
            <span>Open to opportunities</span>
          </div>
        </motion.div>

        {/* Staggered Letter Reveal for Large Name */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate={preloaderComplete ? "visible" : "hidden"}
          className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight font-heading flex flex-wrap justify-center text-[#1A110A] leading-[1.1] max-w-full"
        >
          {nameLetters.map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className={char === " " ? "inline-block w-4" : "inline-block text-[#1A110A]"}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Rotating Typewriter Line */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-lg sm:text-2xl md:text-3xl font-medium tracking-tight flex items-center justify-center gap-2"
        >
          <span className="text-[#6F6B60]">I build as a</span>
          <Typewriter
            words={["MERN Stack Developer", "DSA Enthusiast", "AI/ML Learner"]}
            typingSpeed={85}
            deletingSpeed={40}
            pauseDuration={2000}
          />
        </motion.div>

        {/* Pitch taken from Career Objective */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-[#6F6B60] text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed text-center"
        >
          {personalInfo.objective}
        </motion.p>

        {/* Magnetic Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-2"
        >
          <Magnetic strength={0.35}>
            <a
              href="#projects"
              onClick={handleScrollToProjects}
              className="group inline-flex items-center gap-2 px-7 py-3.5 min-h-[44px] rounded-full text-sm font-bold bg-[#F79F15] text-[#1A110A] hover:bg-[#1A110A] hover:text-[#FFFFFF] shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-mono"
            >
              <span>View My Work</span>
              <FiArrowRight className="transition-transform group-hover:translate-x-1 text-base" />
            </a>
          </Magnetic>

          <Magnetic strength={0.35}>
            <a
              href={personalInfo.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 min-h-[44px] rounded-full text-sm font-semibold border border-[#1A110A] bg-[#FFFFFF] hover:bg-[#F8F5EE] text-[#1A110A] transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-mono shadow-sm"
            >
              <span>Download Resume</span>
              <FiDownload className="text-[#F79F15] text-base" />
            </a>
          </Magnetic>
        </motion.div>
      </div>

      {/* 3. Bottom "Scroll to explore" cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        role="button"
        tabIndex={0}
        aria-label="Scroll to explore about section"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleScrollDown();
        }}
        className="absolute bottom-8 z-20 flex flex-col items-center gap-2 cursor-pointer group p-2 min-h-[44px] justify-center"
        onClick={handleScrollDown}
      >
        <span className="text-[11px] font-mono tracking-[0.2em] text-[#6F6B60] group-hover:text-[#F79F15] uppercase transition-colors">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="text-[#1A110A] group-hover:text-[#F79F15] transition-colors"
        >
          <FiArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}

