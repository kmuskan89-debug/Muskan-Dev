import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useSpring, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { useLenis } from "./SmoothScroll";
import { useActiveSection } from "../context/SectionContext";

const SECTION_MAP = {
  home: "{intro}",
  about: "{about}",
  skills: "{skills}",
  projects: "{projects}",
  contact: "{contact}",
};

const DROPDOWN_SECTIONS = [
  { id: "home", name: "Intro", code: "{intro}", href: "#home" },
  { id: "about", name: "About", code: "{about}", href: "#about" },
  { id: "skills", name: "Skills", code: "{skills}", href: "#skills" },
  { id: "projects", name: "Projects", code: "{projects}", href: "#projects" },
  { id: "contact", name: "Contact", code: "{contact}", href: "#contact" },
];

export default function TopProgressBar() {
  const lenis = useLenis();
  const { activeSection, setActiveSection } = useActiveSection();
  const shouldReduceMotion = useReducedMotion();

  const [percentage, setPercentage] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);

  // Percentage motion value and spring for smooth visual fill
  const percentMotion = useMotionValue(0);
  const springPercent = useSpring(percentMotion, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  // Calculate integer percentage
  const calculateProgress = useCallback(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return 0;
    const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
    const raw = (currentScroll / docHeight) * 100;
    return Math.min(100, Math.max(0, Math.round(raw)));
  }, []);

  // Update scroll percentage and track body resize for lazy loading
  useEffect(() => {
    let currentInt = 0;

    const handleScroll = () => {
      const nextInt = calculateProgress();
      percentMotion.set(nextInt);
      if (nextInt !== currentInt) {
        currentInt = nextInt;
        setPercentage(nextInt);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    const ro = new ResizeObserver(() => {
      handleScroll();
    });
    if (document.body) {
      ro.observe(document.body);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      ro.disconnect();
    };
  }, [calculateProgress, percentMotion]);

  // Section label with typing effect (20ms/letter) on change
  const targetLabel = SECTION_MAP[activeSection] || "{intro}";
  const [displayLabel, setDisplayLabel] = useState(targetLabel);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayLabel(targetLabel);
      return;
    }

    let charIdx = 0;
    setDisplayLabel(targetLabel.slice(0, 1));

    const interval = setInterval(() => {
      charIdx++;
      setDisplayLabel(targetLabel.slice(0, charIdx));
      if (charIdx >= targetLabel.length) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [targetLabel, shouldReduceMotion]);

  // Dropdown click outside and Escape listener
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleGlobalKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setDropdownOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [dropdownOpen]);

  // Keyboard navigation inside dropdown menu
  const handleDropdownKeyDown = (e) => {
    if (!dropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setDropdownOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % DROPDOWN_SECTIONS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + DROPDOWN_SECTIONS.length) % DROPDOWN_SECTIONS.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusedIndex(DROPDOWN_SECTIONS.length - 1);
    } else if (e.key === "Tab") {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [dropdownOpen, focusedIndex]);

  // Handle section jumping with Lenis
  const handleSectionSelect = (href) => {
    setDropdownOpen(false);
    buttonRef.current?.focus();
    const secId = href.substring(1);
    setActiveSection(secId);

    if (lenis) {
      if (href === "#home") {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        lenis.scrollTo(href, { offset: -116, duration: 1.2 });
      }
    } else {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const remainingPercent = Math.max(0, 100 - percentage);

  // Convert spring motion value into percentage string for Framer Motion style
  const springWidthString = useTransform(springPercent, (val) => `${val}%`);
  const fillWidth = shouldReduceMotion ? `${percentage}%` : springWidthString;

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 right-0 h-[44px] z-[90] bg-[#1A110A] border-b border-[#F5F3E7]/10 px-3 sm:px-6 flex items-center justify-between gap-3 select-none"
    >
      {/* 1. Left: Orange Arrow + Bold Cream Scroll Percentage */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 font-mono select-none">
        <span aria-hidden="true" className="text-[#F79F15] text-sm sm:text-base font-bold">
          ➜
        </span>
        <span className="text-[#F5F3E7] font-bold text-xs sm:text-sm tracking-tight min-w-[3ch] sm:min-w-[4ch] text-left">
          {percentage}%
        </span>
      </div>

      {/* 2. Center: Rounded Rectangle Track with Orange Fill and Section Label */}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page scroll progress"
        className="relative flex-1 min-w-0 h-7 rounded-[10px] border border-[#F5F3E7]/15 bg-white/[0.04] flex items-center overflow-hidden"
      >
        {/* Animated Orange Fill with Section Label inside (never narrower than label) */}
        <motion.div
          style={{
            width: fillWidth,
            minWidth: "max-content",
          }}
          className="h-full bg-[#F79F15] rounded-[9px] flex items-center px-2.5 z-10 overflow-hidden max-w-full"
        >
          <span className="font-mono font-bold text-xs sm:text-sm text-[#1A110A] whitespace-nowrap select-none">
            {displayLabel}
            <span
              aria-hidden="true"
              className={shouldReduceMotion ? "inline ml-0.5" : "inline ml-0.5 animate-pulse"}
            >
              _
            </span>
          </span>
        </motion.div>

        {/* Remaining Percentage Text inside Right End of Track (hidden on mobile <= 640px) */}
        <div className="absolute right-3 hidden sm:flex items-center pointer-events-none z-20">
          <span
            aria-hidden="true"
            className={`text-xs font-mono transition-colors duration-150 ${
              percentage > 85 ? "text-[#1A110A] font-semibold" : "text-[#9F9B90]"
            }`}
          >
            {remainingPercent}% remaining
          </span>
        </div>
      </div>

      {/* 3. Far Right: 36px Rounded Square Dropdown Button (44px mobile tap area) */}
      <div className="relative shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px]">
        <button
          ref={buttonRef}
          id="section-dropdown-btn"
          type="button"
          aria-label="Jump to section"
          aria-expanded={dropdownOpen}
          aria-controls="section-dropdown-menu"
          aria-haspopup="menu"
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
            setFocusedIndex(-1);
          }}
          onKeyDown={handleDropdownKeyDown}
          className="w-9 h-9 rounded-lg border border-[#F5F3E7]/25 hover:border-[#F79F15] bg-transparent hover:bg-white/5 text-[#F5F3E7] hover:text-[#F79F15] flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F5F3E7] focus:ring-offset-1 focus:ring-offset-[#1A110A]"
        >
          <FiChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180 text-[#F79F15]" : "text-[#F5F3E7]"
            }`}
          />
        </button>

        {/* Dropdown Menu (Cream card, ink text, orange hover) */}
        {dropdownOpen && (
          <div
            ref={dropdownRef}
            id="section-dropdown-menu"
            role="menu"
            aria-labelledby="section-dropdown-btn"
            onKeyDown={handleDropdownKeyDown}
            className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-[#F5F3E7] border border-[#1A110A]/10 shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 text-[#1A110A]"
          >
            {DROPDOWN_SECTIONS.map((sec, idx) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  ref={(el) => (itemRefs.current[idx] = el)}
                  role="menuitem"
                  tabIndex={focusedIndex === idx ? 0 : -1}
                  type="button"
                  onClick={() => handleSectionSelect(sec.href)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#1A110A] text-[#F79F15] font-bold"
                      : "hover:bg-[#F79F15]/15 hover:text-[#F79F15] text-[#1A110A]"
                  } focus:outline-none focus:ring-2 focus:ring-[#1A110A] focus:ring-offset-2 focus:ring-offset-[#F79F15]`}
                >
                  <span className="font-sans font-medium text-xs">{sec.name}</span>
                  <span className="text-[11px] opacity-75 font-bold">{sec.code}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

