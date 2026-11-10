import React, { useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLenis } from "./SmoothScroll";
import { FiMail, FiArrowDownRight, FiExternalLink } from "react-icons/fi";
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
    <div className="w-full pt-12 pb-4 flex flex-col gap-5 relative">
      {/* Top Tagline Bar */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-center justify-between gap-3 px-1"
      >
        <div className="inline-flex items-center gap-3 select-none">
          {words.map((item, idx) => (
            <React.Fragment key={idx}>
              <span
                className="text-sm sm:text-base font-bold font-heading tracking-wider uppercase"
                style={{ color: item.color }}
              >
                {item.text}
              </span>
              {idx < words.length - 1 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15]" />
              )}
            </React.Fragment>
          ))}
        </div>

        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#6F6B60]">
          // CHOOSE YOUR NEXT MOVE
        </span>
      </motion.div>

      {/* Dual Interactive Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* ====================================================== */}
        {/* CARD 1: CONTACT ME (Warm White Editorial Card)         */}
        {/* ====================================================== */}
        <motion.a
          href="#contact"
          onClick={handleScrollToContact}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          whileHover={shouldReduceMotion ? {} : { y: -3 }}
          className="group relative rounded-[26px] bg-[#FFFFFF] border border-[#1A110A]/15 hover:border-[#F79F15] p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between gap-5 overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
        >
          {/* Subtle Warm Corner Glow on Hover */}
          <div
            aria-hidden="true"
            className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-[#F79F15]/12 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          />

          <div className="relative z-10 flex flex-col gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-[#F8F5EE] border border-[#1A110A]/10 font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A110A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15]" />
              Get In Touch
            </span>

            <h3 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-[#1A110A] group-hover:text-[#F79F15] transition-colors">
              Contact Me
            </h3>

            <p className="text-xs sm:text-sm text-[#6F6B60] leading-relaxed max-w-xs">
              Have a role, project, or collaboration in mind? Head straight to my inbox.
            </p>

            <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#1A110A]">
              <span>Go to contact section</span>
              <FiArrowDownRight className="text-sm text-[#F79F15] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </span>
          </div>

          {/* Right Tactile Icon Tile */}
          <div className="relative z-10 shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F79F15] text-[#1A110A] group-hover:bg-[#1A110A] group-hover:text-[#F79F15] border border-[#1A110A]/15 shadow-md flex items-center justify-center transition-all duration-300 group-hover:rotate-3 group-hover:scale-105">
            <FiMail className="text-2xl sm:text-3xl" />
          </div>
        </motion.a>

        {/* ====================================================== */}
        {/* CARD 2: PLAY WITH ME (Dark Ink Chess Arena Card)       */}
        {/* ====================================================== */}
        <motion.a
          href="https://chess-arena-zeta-eight.vercel.app/play"
          target="_blank"
          rel="noopener noreferrer"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          whileHover={shouldReduceMotion ? {} : { y: -3 }}
          className="group relative rounded-[26px] bg-[#1A110A] border border-[#1A110A] hover:border-[#F79F15] p-6 sm:p-7 shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-between gap-5 overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F79F15] focus-visible:outline-offset-2"
        >
          {/* Subtle Checkered Chessboard Backdrop Pattern */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.11] transition-opacity duration-500 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #F5F3E7 25%, transparent 25%), linear-gradient(-45deg, #F5F3E7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #F5F3E7 75%), linear-gradient(-45deg, transparent 75%, #F5F3E7 75%)",
              backgroundSize: "32px 32px",
              backgroundPosition: "0 0, 0 16px, 16px -16px, -16px 0",
            }}
          />

          {/* Subtle Orange Ambient Glow */}
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[#F79F15]/20 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          />

          <div className="relative z-10 flex flex-col gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-[#F79F15] font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A110A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A110A]" />
              Chess Arena
            </span>

            <h3 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-[#F5F3E7] group-hover:text-[#F79F15] transition-colors">
              Play With Me
            </h3>

            <p className="text-xs sm:text-sm text-[#9F9B90] leading-relaxed max-w-xs">
              Take a quick break and play a live match on my Chess Arena web app.
            </p>

            <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#F79F15]">
              <span>Launch Chess Arena</span>
              <FiExternalLink className="text-xs transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>

          {/* Right Mini 2x2 Chessboard Tile with Knight */}
          <div className="relative z-10 shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#F79F15]/60 shadow-lg grid grid-cols-2 grid-rows-2 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
            <div className="bg-[#F5F3E7]" />
            <div className="bg-[#F79F15]" />
            <div className="bg-[#F79F15]" />
            <div className="bg-[#F5F3E7]" />
            <div className="absolute inset-0 flex items-center justify-center bg-[#1A110A]/30">
              <FaChessKnight className="text-2xl sm:text-3xl text-[#FFFFFF] drop-shadow-[0_2px_6px_rgba(26,17,10,0.9)] transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>
        </motion.a>
      </div>
    </div>
  );
}
