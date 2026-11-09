import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "../components/SmoothScroll";
import Preloader from "../components/Preloader";
import CustomCursor from "../components/CustomCursor";
import TopProgressBar from "../components/TopProgressBar";
import Navbar from "../components/Navbar";
import { SectionProvider } from "../context/SectionContext";
import Hero from "../sections/Hero";
import About from "../sections/About";
import { personalInfo } from "../data/content";
import { SITE_URL } from "../lib/site";

gsap.registerPlugin(ScrollTrigger);

// Dynamic import declarations for background prefetching
const loadSkills = () => import("../sections/Skills");
const loadProjects = () => import("../sections/Projects");
const loadContact = () => import("../sections/Contact");
const loadFooter = () => import("../components/Footer");

// Below-the-fold sections lazy-loaded for peak production performance
const Skills = lazy(loadSkills);
const Projects = lazy(loadProjects);
const Contact = lazy(loadContact);
const Footer = lazy(loadFooter);

// Skeleton with realistic min-height to prevent layout jumps and ensure anchor stability
function SectionSkeleton({ id, label, minHeight = "min-h-screen" }) {
  return (
    <section
      id={id}
      className={`w-full flex flex-col justify-center items-center px-6 py-28 max-w-6xl mx-auto ${minHeight}`}
    >
      <div className="card rounded-[28px] p-10 flex flex-col items-center gap-4 text-center">
        {label && <div className="section-label">{label}</div>}
        <div className="w-8 h-8 rounded-full border-2 border-[#9F9B90] border-t-[#F79F15] animate-spin" />
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

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderComplete(true);
  }, []);

  // Safeguard: Ensure scroll is unlocked and Lenis resumed once preloader is complete
  useEffect(() => {
    if (preloaderComplete) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      lenis?.start();
      lenis?.resize();
    }
  }, [preloaderComplete, lenis]);

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
    <SectionProvider>
      <div className="relative min-h-screen bg-[#F5F3E7] text-[#1A110A] selection:bg-[#F79F15] selection:text-[#1A110A]">
        {/* Accessible Skip to Content Link */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-[52px] focus:left-4 focus:z-[300] focus:px-5 focus:py-3 focus:rounded-full focus:bg-[#1A110A] focus:text-[#F5F3E7] focus:font-body focus:font-bold focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#F79F15]"
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

        {/* Fake Error Screen Preloader */}
        <Preloader onComplete={handlePreloaderComplete} />

        {/* Code-Editor Style Top Progress Bar (shown only after 404 intro finishes, never on /admin) */}
        {preloaderComplete && <TopProgressBar />}

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

        {/* 3. Skills Section & Philosophy Pull-Quote (Lazy ~920px) */}
        <Suspense
          fallback={
            <SectionSkeleton
              id="skills"
              label="// 02. SKILLS"
              minHeight="min-h-[920px]"
            />
          }
        >
          <LazyBoundary onLoaded={refreshLayout}>
            <Skills />
          </LazyBoundary>
        </Suspense>

        {/* 4. Projects Section & Animated Tagline Strip */}
        <Suspense
          fallback={
            <SectionSkeleton
              id="projects"
              label="// 03. PROJECTS"
              minHeight="min-h-[700px]"
            />
          }
        >
          <LazyBoundary onLoaded={refreshLayout}>
            <Projects />
          </LazyBoundary>
        </Suspense>

        {/* 5. Contact Section & Interactive Guestbook (Lazy ~1550px) */}
        <Suspense
          fallback={
            <SectionSkeleton
              id="contact"
              label="// 04. CONTACT"
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
      <Suspense fallback={<div className="w-full min-h-[380px] bg-[#1A110A]" />}>
        <LazyBoundary onLoaded={refreshLayout}>
          <Footer />
        </LazyBoundary>
      </Suspense>
    </div>
  </SectionProvider>
  );
}

