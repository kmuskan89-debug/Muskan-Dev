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
      lenis.scrollTo("#projects", { offset: -70, duration: 1.2 });
    } else {
      document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollDown = () => {
    if (lenis) {
      lenis.scrollTo("#about", { offset: -70, duration: 1.2 });
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
      className="relative min-h-screen w-full flex flex-col justify-center items-center px-6 overflow-hidden bg-[#060B16]"
    >
      {/* 1. React Three Fiber Canvas Background (Decorative) */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-[#060B16] bg-[radial-gradient(circle_at_center,_#0E1626_0%,_#060B16_100%)] pointer-events-none" />
          }
        >
          <HeroCanvas isVisible={isVisible} />
        </Suspense>
      </div>

      {/* 2. Foreground Content Container */}
      <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center text-center gap-7 pt-16">
        
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

          <span className="text-white/20">•</span>

          {/* Availability Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E1626]/80 border border-emerald-500/30 text-xs font-mono text-emerald-400 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>Open to opportunities</span>
          </div>
        </motion.div>

        {/* Staggered Letter Reveal for Large Name */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate={preloaderComplete ? "visible" : "hidden"}
          className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight font-heading flex flex-wrap justify-center text-[#E8EDF3] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] leading-[1.1] max-w-full"
        >
          {nameLetters.map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className={char === " " ? "inline-block w-4" : "inline-block gradient-text"}
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
          <span className="text-[#8A97AB]">I build as a</span>
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
          className="text-[#8A97AB] text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed text-center"
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
              className="group inline-flex items-center gap-2 px-7 py-3.5 min-h-[44px] rounded-full text-sm font-semibold bg-gradient-to-r from-[#4DA3FF] to-[#5EEAD4] text-[#060B16] shadow-[0_0_25px_rgba(77,163,255,0.35)] hover:shadow-[0_0_35px_rgba(94,234,212,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-mono"
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
              className="inline-flex items-center gap-2 px-7 py-3.5 min-h-[44px] rounded-full text-sm font-medium border border-white/10 hover:border-[#4DA3FF]/50 bg-[#0E1626]/80 hover:bg-[#0E1626] text-[#E8EDF3] backdrop-blur-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-mono shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <span>Download Resume</span>
              <FiDownload className="text-[#5EEAD4] text-base" />
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
        <span className="text-[11px] font-mono tracking-[0.2em] text-[#8A97AB] group-hover:text-[#5EEAD4] uppercase transition-colors">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="text-[#4DA3FF] group-hover:text-[#5EEAD4] transition-colors"
        >
          <FiArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}

