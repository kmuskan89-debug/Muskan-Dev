import React, { useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLenis } from "./SmoothScroll";
import Magnetic from "./Magnetic";
import { FiMail, FiArrowRight, FiExternalLink } from "react-icons/fi";
import { FaChessKnight } from "react-icons/fa";

export default function TaglineStrip() {
  const lenis = useLenis();
  const shouldReduceMotion = useReducedMotion();

  const words = [
    { text: "Ideas", color: "#1A110A" },
    { text: "Code", color: "#F79F15" },
    { text: "Impact", color: "#1A110A" },
  ];

  const handleScrollToContact = useCallback(
    (e) => {
      e?.preventDefault?.();
      if (lenis) {
        lenis.scrollTo("#contact", { offset: -116, duration: 1.1 });
      } else {
        document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [lenis]
  );

  return (
    <div className="w-full pt-12 pb-6 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
      {/* Background soft ambient glow */}
      <div className="absolute w-72 h-24 bg-[#F79F15]/8 rounded-full blur-[70px] pointer-events-none" />

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.6 }}
        className="bg-[#FFFFFF] rounded-full px-6 sm:px-10 py-3.5 flex items-center gap-3 sm:gap-6 border border-[#9F9B90]/30 shadow-md select-none"
      >
        {words.map((item, idx) => (
          <React.Fragment key={idx}>
            <span
              className="text-base sm:text-xl md:text-2xl font-bold font-heading tracking-wider"
              style={{ color: item.color }}
            >
              {item.text}
            </span>

            {idx < words.length - 1 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15] shadow-sm animate-pulse" />
            )}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Action Buttons: Contact Me & Play With Me */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
      >
        <Magnetic strength={0.3}>
          <a
            href="#contact"
            onClick={handleScrollToContact}
            className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 min-h-[44px] rounded-full text-xs sm:text-sm font-bold bg-[#F79F15] text-[#1A110A] hover:bg-[#1A110A] hover:text-[#F5F3E7] shadow-md transition-all font-mono group focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
          >
            <FiMail className="text-sm sm:text-base shrink-0" />
            <span>Contact Me</span>
            <FiArrowRight className="text-sm transition-transform group-hover:translate-x-1 shrink-0" />
          </a>
        </Magnetic>

        <Magnetic strength={0.3}>
          <a
            href="https://chess-arena-zeta-eight.vercel.app/play"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 min-h-[44px] rounded-full text-xs sm:text-sm font-bold bg-[#1A110A] text-[#F5F3E7] hover:bg-[#F79F15] hover:text-[#1A110A] border border-[#1A110A] shadow-md transition-all font-mono group focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
          >
            <FaChessKnight className="text-sm sm:text-base text-[#F79F15] group-hover:text-[#1A110A] transition-colors shrink-0" />
            <span>Play With Me</span>
            <FiExternalLink className="text-xs sm:text-sm opacity-80 shrink-0" />
          </a>
        </Magnetic>
      </motion.div>
    </div>
  );
}
