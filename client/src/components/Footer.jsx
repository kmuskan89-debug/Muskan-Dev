import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLenis } from "./SmoothScroll";
import Magnetic from "./Magnetic";
import { personalInfo } from "../data/content";

// Icons
import { FiArrowUp, FiGithub, FiLinkedin, FiHeart } from "react-icons/fi";
import { SiLeetcode } from "react-icons/si";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Achievements", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const lenis = useLenis();
  const shouldReduceMotion = useReducedMotion();

  const handleScrollTo = (target) => {
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2 });
    } else {
      if (target === 0 || target === "#home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="relative w-full border-t border-white/10 bg-[#060B16] text-[#8A97AB] overflow-hidden pt-20 pb-12">
      {/* Background radial accent glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-gradient-to-t from-[#4DA3FF]/10 via-[#5EEAD4]/5 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-16 relative z-10">
        {/* Oversized "THANKS FOR VISITING" Typography with subtle scroll reveal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full text-center select-none"
        >
          <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white/10 to-transparent uppercase leading-tight sm:leading-none break-words">
            THANKS FOR VISITING
          </h2>
        </motion.div>

        {/* Middle Navigation & Social Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/5">
          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleScrollTo(link.href)}
                className="text-xs font-mono uppercase tracking-wider text-[#8A97AB] hover:text-[#5EEAD4] transition-colors cursor-pointer min-h-[44px] flex items-center px-2"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Social Icons & Back to top button */}
          <div className="flex items-center gap-3">
            {/* GitHub */}
            <Magnetic strength={0.3}>
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                aria-label="Visit Muskan's GitHub profile"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl glass-card border border-white/10 hover:border-[#5EEAD4]/50 flex items-center justify-center text-[#8A97AB] hover:text-[#5EEAD4] transition-all"
              >
                <FiGithub className="text-lg" />
              </a>
            </Magnetic>

            {/* LinkedIn */}
            <Magnetic strength={0.3}>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                aria-label="Visit Muskan's LinkedIn profile"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl glass-card border border-white/10 hover:border-[#4DA3FF]/50 flex items-center justify-center text-[#8A97AB] hover:text-[#4DA3FF] transition-all"
              >
                <FiLinkedin className="text-lg" />
              </a>
            </Magnetic>

            {/* LeetCode */}
            <Magnetic strength={0.3}>
              <a
                href={personalInfo.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                title="LeetCode"
                aria-label="Visit Muskan's LeetCode profile"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl glass-card border border-white/10 hover:border-[#FFA116]/50 flex items-center justify-center text-[#8A97AB] hover:text-[#FFA116] transition-all"
              >
                <SiLeetcode className="text-lg" />
              </a>
            </Magnetic>

            {/* Back to top button */}
            <Magnetic strength={0.35}>
              <button
                type="button"
                onClick={() => handleScrollTo(0)}
                title="Back to top"
                aria-label="Scroll back to top"
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl glass-card border border-white/10 hover:border-[#5EEAD4]/50 text-xs font-mono font-medium text-[#E8EDF3] hover:text-[#5EEAD4] transition-all cursor-pointer shadow-sm group"
              >
                <span>Back to top</span>
                <FiArrowUp className="text-sm transition-transform group-hover:-translate-y-1" />
              </button>
            </Magnetic>
          </div>
        </div>

        {/* Bottom Copyright & Built With Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8A97AB]/70 pt-6 border-t border-white/5">
          <p>© 2026 {personalInfo.name}</p>
          <p className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <FiHeart className="text-xs text-[#4DA3FF]" />
            <span>using React, Tailwind CSS & Lenis</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

