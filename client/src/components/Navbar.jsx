import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useLenis } from "./SmoothScroll";
import Magnetic from "./Magnetic";
import { personalInfo } from "../data/content";
import { useActiveSection } from "../context/SectionContext";
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
  const { activeSection, setActiveSection } = useActiveSection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide on scroll down, reveal on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 120 && !mobileMenuOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [mobileMenuOpen, lenis]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.substring(1);
    setActiveSection(targetId);

    if (lenis) {
      if (href === "#home") {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        lenis.scrollTo(href, { offset: -116, duration: 1.2 });
      }
    } else {
      const targetEl = document.querySelector(href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {/* Floating Navbar Container (sitting at top = 44px + 12px = 56px) */}
      <motion.header
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -120, opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-[56px] inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <nav className="pointer-events-auto rounded-full px-3 py-2 flex items-center justify-between gap-4 max-w-4xl w-full border border-black/20 shadow-xl bg-[#1A110A] text-[#F5F3E7]">
          {/* Brand Monogram */}
          <Magnetic strength={0.25}>
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "#home")}
              aria-label="Muskan Kumari - Home"
              className="flex items-center gap-2 pl-3 py-1 group min-h-[44px]"
            >
              <span className="font-mono font-bold text-sm tracking-wider text-[#F79F15]">
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
                    isActive ? "text-[#F79F15]" : "text-[#9F9B90] hover:text-[#F5F3E7]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-full bg-white/10 border border-white/10 -z-10 shadow-sm"
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
                href={personalInfo.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-4 py-2 rounded-full bg-[#F79F15] text-[#1A110A] hover:bg-[#FFFFFF] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
              >
                <span>Resume</span>
                <FiDownload className="text-sm" />
              </a>
            </Magnetic>
          </div>

          {/* Mobile Hamburger Toggle (44px min tap target) */}
          <div className="flex md:hidden pr-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-[#F5F3E7] hover:text-[#F79F15] hover:bg-white/5 transition-colors flex items-center justify-center cursor-pointer"
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
            className="fixed inset-0 top-[44px] z-40 bg-[#1A110A]/95 md:hidden flex flex-col justify-center px-8"
          >
            <div className="flex flex-col gap-6">
              <span className="section-label text-xs tracking-[0.2em] text-[#F79F15]">
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
                      className={`text-2xl font-bold font-mono tracking-tight flex items-center justify-between min-h-[48px] py-2 ${
                        isActive ? "text-[#F79F15]" : "text-[#9F9B90] hover:text-[#F5F3E7]"
                      }`}
                    >
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#F79F15] shadow-[0_0_8px_#F79F15]" />
                      )}
                    </motion.a>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-white/10">
                <a
                  href={personalInfo.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-mono font-bold py-3 px-6 rounded-xl bg-[#F79F15] text-[#1A110A] hover:bg-[#FFFFFF] transition-colors"
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

