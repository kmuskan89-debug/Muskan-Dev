import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "../components/SmoothScroll";
import Preloader from "../components/Preloader";
import CustomCursor from "../components/CustomCursor";
import ScrollProgress from "../components/ScrollProgress";
import Navbar from "../components/Navbar";
import Hero from "../sections/Hero";
import About from "../sections/About";
import { personalInfo } from "../data/content";
import { SITE_URL } from "../lib/site";

gsap.registerPlugin(ScrollTrigger);

// Dynamic import declarations for background prefetching
const loadSkills = () => import("../sections/Skills");
const loadProjects = () => import("../sections/Projects");
const loadAchievements = () => import("../sections/Achievements");
const loadContact = () => import("../sections/Contact");
const loadFooter = () => import("../components/Footer");

// Below-the-fold sections lazy-loaded for peak production performance
const Skills = lazy(loadSkills);
const Projects = lazy(loadProjects);
const Achievements = lazy(loadAchievements);
const Contact = lazy(loadContact);
const Footer = lazy(loadFooter);

// Skeleton with realistic min-height to prevent layout jumps and ensure anchor stability
function SectionSkeleton({ id, label, minHeight = "min-h-screen" }) {
  return (
    <section
      id={id}
      className={`w-full flex flex-col justify-center items-center px-6 py-28 max-w-6xl mx-auto ${minHeight}`}
    >
      <div className="glass-card rounded-3xl p-10 flex flex-col items-center gap-4 text-center border border-white/5 bg-[#0E1626]/40 backdrop-blur-sm">
        {label && <div className="section-label">{label}</div>}
        <div className="w-8 h-8 rounded-full border-2 border-[#4DA3FF]/30 border-t-[#5EEAD4] animate-spin" />
      </div>
    </section>
  );
}

// Wrapper component to notify when a lazy chunk has mounted in DOM
function LazyBoundary({ children, onLoaded }) {
  useEffect(() => {
    onLoaded?.();
  }, [onLoaded]);

  return children;
}

export default function Portfolio() {
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const lenis = useLenis();

  // Unified recalculation handler for ScrollTrigger and Lenis dimensions
  const refreshLayout = useCallback(() => {
    requestAnimationFrame(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
    });
  }, [lenis]);

  // 1. Idle-time chunk preloading: fetches chunks in background during browser idle time
  useEffect(() => {
    const preloadChunks = () => {
      loadSkills();
      loadProjects();
      loadAchievements();
      loadContact();
      loadFooter();
    };

    if ("requestIdleCallback" in window) {
      const idleHandle = window.requestIdleCallback(preloadChunks, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(idleHandle);
    } else {
      const timer = setTimeout(preloadChunks, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  // 2. Global layout synchronization after fonts, window load, and image decoding
  useEffect(() => {
    const handleFullRefresh = () => {
      refreshLayout();
    };

    // Recalculate once web fonts finish loading
    if (document.fonts?.ready) {
      document.fonts.ready.then(handleFullRefresh);
    }

    window.addEventListener("load", handleFullRefresh);
    window.addEventListener("resize", handleFullRefresh);

    // Refresh after preloader exit transition completes
    const timer = setTimeout(handleFullRefresh, 1600);

    return () => {
      window.removeEventListener("load", handleFullRefresh);
      window.removeEventListener("resize", handleFullRefresh);
      clearTimeout(timer);
    };
  }, [refreshLayout]);

  return (
    <div className="relative min-h-screen bg-[#060B16] text-[#E8EDF3] selection:bg-[#4DA3FF]/30 selection:text-[#5EEAD4]">
      {/* Accessible Skip to Content Link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:px-5 focus:py-3 focus:rounded-xl focus:bg-[#5EEAD4] focus:text-[#060B16] focus:font-mono focus:font-bold focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#4DA3FF]"
      >
        Skip to content
      </a>

      <Helmet>
        <title>{personalInfo.name} | MERN Stack Developer</title>
        <meta
          name="description"
          content="MERN stack developer with hands-on project experience and strong DSA fundamentals, seeking an SDE role to build scalable web applications. Currently learning AI/ML."
        />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta
          property="og:description"
          content="MERN stack developer with hands-on project experience and strong DSA fundamentals, seeking an SDE role to build scalable web applications. Currently learning AI/ML."
        />
        <meta name="twitter:url" content={`${SITE_URL}/`} />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
        <meta
          name="twitter:description"
          content="MERN stack developer with hands-on project experience and strong DSA fundamentals, seeking an SDE role to build scalable web applications. Currently learning AI/ML."
        />
      </Helmet>

      {/* 1.2s Preloader with MK Monogram Drawing */}
      <Preloader onComplete={() => setPreloaderComplete(true)} />

      {/* Thin Scroll Progress Bar */}
      <ScrollProgress />

      {/* Desktop Custom Cursor with Trailing Ring */}
      <CustomCursor />

      {/* Floating Glass Navbar */}
      <Navbar />

      {/* Main Page Content */}
      <main id="main" tabIndex={-1} className="relative z-10 flex flex-col focus:outline-none">
        {/* 1. Hero Section (Eager) */}
        <Hero preloaderComplete={preloaderComplete} />

        {/* 2. About Section & Full-Width Marquee Strip (Eager) */}
        <About />

        {/* 3. Skills Section & Philosophy Pull-Quote (Lazy ~1450px) */}
        <Suspense
          fallback={
            <SectionSkeleton
              id="skills"
              label="// 02. SKILLS"
              minHeight="min-h-[1450px]"
            />
          }
        >
          <LazyBoundary onLoaded={refreshLayout}>
            <Skills />
          </LazyBoundary>
        </Suspense>

        {/* 4. Projects Section & Animated Tagline Strip (Lazy ~1950px) */}
        <Suspense
          fallback={
            <SectionSkeleton
              id="projects"
              label="// 03. PROJECTS"
              minHeight="min-h-[1950px]"
            />
          }
        >
          <LazyBoundary onLoaded={refreshLayout}>
            <Projects />
          </LazyBoundary>
        </Suspense>

        {/* 5. Achievements Section (Lazy ~1500px) */}
        <Suspense
          fallback={
            <SectionSkeleton
              id="achievements"
              label="// 04. ACHIEVEMENTS"
              minHeight="min-h-[1500px]"
            />
          }
        >
          <LazyBoundary onLoaded={refreshLayout}>
            <Achievements />
          </LazyBoundary>
        </Suspense>

        {/* 6. Contact Section & Interactive Guestbook (Lazy ~1550px) */}
        <Suspense
          fallback={
            <SectionSkeleton
              id="contact"
              label="// 05. CONTACT"
              minHeight="min-h-[1550px]"
            />
          }
        >
          <LazyBoundary onLoaded={refreshLayout}>
            <Contact />
          </LazyBoundary>
        </Suspense>
      </main>

      {/* Global Footer (Lazy ~380px) */}
      <Suspense fallback={<div className="w-full min-h-[380px] bg-[#060B16]" />}>
        <LazyBoundary onLoaded={refreshLayout}>
          <Footer />
        </LazyBoundary>
      </Suspense>
    </div>
  );
}

