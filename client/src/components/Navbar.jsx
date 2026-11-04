import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useLenis } from "./SmoothScroll";
import Magnetic from "./Magnetic";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { FiDownload } from "react-icons/fi";

const NAV_ITEMS = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Achievements", href: "#achievements" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const lenis = useLenis();
  const { scrollY } = useScroll();

  const [hidden, setHidden] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide on scroll down, reveal on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 120) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.href.substring(1));
    const observers = [];

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "-25% 0px -55% 0px", // focus around center of viewport
      threshold: 0.1,
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (lenis) {
      lenis.scrollTo(href, { offset: -70, duration: 1.2 });
    } else {
      const targetEl = document.querySelector(href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {/* Floating Navbar Container */}
      <motion.header
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -90, opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <nav className="pointer-events-auto glass-card rounded-full px-3 py-2 flex items-center justify-between gap-4 max-w-4xl w-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[#0E1626]/85 backdrop-blur-md">
          {/* Brand Monogram */}
          <Magnetic strength={0.25}>
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "#home")}
              className="flex items-center gap-2 pl-3 py-1 group"
            >
              <span className="font-mono font-bold text-sm tracking-wider gradient-text-accent">
                // MK
              </span>
            </a>
          </Magnetic>

          {/* Desktop Nav Items with Sliding Active Highlight */}
          <div className="hidden md:flex items-center gap-1 relative">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative px-4 py-1.5 text-sm font-medium transition-colors duration-200 z-10 ${
                    isActive ? "text-[#5EEAD4]" : "text-[#8A97AB] hover:text-[#E8EDF3]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-full bg-[#4DA3FF]/15 border border-[#4DA3FF]/30 -z-10 shadow-[0_0_12px_rgba(77,163,255,0.2)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Right Action: Resume Button */}
          <div className="hidden md:flex items-center pr-1">
            <Magnetic strength={0.3}>
              <a
                href="/Muskan_Kumari_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-[#4DA3FF] to-[#5EEAD4] text-[#060B16] shadow-[0_0_15px_rgba(77,163,255,0.3)] hover:shadow-[0_0_20px_rgba(94,234,212,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Resume</span>
                <FiDownload className="text-sm" />
              </a>
            </Magnetic>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden pr-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile navigation menu"
              className="p-2 rounded-lg text-[#E8EDF3] hover:text-[#5EEAD4] hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <HiX size={22} /> : <HiMenuAlt3 size={22} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Full-Screen Animated Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#060B16]/95 md:hidden flex flex-col justify-center px-8"
          >
            <div className="flex flex-col gap-6">
              <span className="section-label text-xs tracking-[0.2em]">
                // NAVIGATION
              </span>

              <nav className="flex flex-col gap-4">
                {NAV_ITEMS.map((item, index) => {
                  const isActive = activeSection === item.href.substring(1);
                  return (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.06, duration: 0.3 }}
                      className={`text-2xl font-bold font-mono tracking-tight flex items-center justify-between ${
                        isActive ? "text-[#5EEAD4]" : "text-[#8A97AB] hover:text-[#E8EDF3]"
                      }`}
                    >
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#5EEAD4] shadow-[0_0_8px_#5EEAD4]" />
                      )}
                    </motion.a>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-white/10">
                <a
                  href="/Muskan_Kumari_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-mono font-semibold py-3 px-6 rounded-xl bg-gradient-to-r from-[#4DA3FF] to-[#5EEAD4] text-[#060B16] shadow-[0_0_20px_rgba(77,163,255,0.4)]"
                >
                  <span>Download Resume</span>
                  <FiDownload size={16} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

