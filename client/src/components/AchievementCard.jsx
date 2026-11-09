import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  animate,
} from "framer-motion";
import { FiExternalLink } from "react-icons/fi";

export default function AchievementCard({
  type = "default", // "count" | "trophy" | "badge"
  targetCount = 100,
  suffix = "+",
  badgeText = "",
  label = "",
  description = "",
  icon: Icon,
  accentColor = "#F79F15",
  link = "",
  linkText = "",
}) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.4 });
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(shouldReduceMotion ? targetCount : 0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  // Mouse tilt motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  // Touch device detection
  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsTouchDevice(!mediaQuery.matches);

    const handleChange = (e) => setIsTouchDevice(!e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Run count-up animation once when scrolled into view
  useEffect(() => {
    if (type !== "count" || !isInView || shouldReduceMotion) return;

    const controls = animate(0, targetCount, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => {
        setCount(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [type, isInView, targetCount, shouldReduceMotion]);

  const handleMouseMove = (e) => {
    if (isTouchDevice || shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);

    glowX.set(e.clientX - rect.left);
    glowY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        isTouchDevice || shouldReduceMotion
          ? {}
          : {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }
      }
      className="group relative bg-[#FFFFFF] rounded-3xl p-7 sm:p-8 flex flex-col justify-between gap-6 border border-[#9F9B90]/30 hover:border-[#F79F15] transition-colors duration-300 overflow-hidden shadow-sm select-none"
    >
      {/* Cursor-Following Radial Glow (Desktop) */}
      {!isTouchDevice && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 -z-10"
          style={{
            opacity: isHovered ? 0.35 : 0,
            background: `radial-gradient(220px circle at ${glowX.get()}px ${glowY.get()}px, rgba(247, 159, 21, 0.18), transparent 75%)`,
          }}
        />
      )}

      {/* Top Header / Icon */}
      <div className="flex items-center justify-between w-full">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#F8F5EE] border border-[#9F9B90]/30 group-hover:border-[#F79F15]/40 text-[#1A110A] group-hover:text-[#F79F15] transition-colors duration-300 shadow-inner"
        >
          {Icon ? <Icon className="text-2xl transition-transform duration-300 group-hover:scale-110" /> : null}
        </div>

        {badgeText && (
          <span className="text-[11px] font-mono tracking-wider uppercase px-3 py-1 rounded-full bg-[#F8F5EE] border border-[#9F9B90]/30 text-[#6F6B60]">
            {badgeText}
          </span>
        )}
      </div>

      {/* Center Hero Stat / Value */}
      <div className="flex flex-col gap-1.5 my-1">
        {type === "count" ? (
          <div className="flex items-baseline gap-1">
            <span className="text-5xl sm:text-6xl font-black font-heading text-[#1A110A] tracking-tight">
              {count}
            </span>
            <span className="text-4xl sm:text-5xl font-black font-heading text-[#F79F15]">
              {suffix}
            </span>
          </div>
        ) : type === "trophy" ? (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-heading text-[#1A110A] tracking-tight">
              1st
            </span>
            <span className="text-xl sm:text-2xl font-bold font-heading text-[#F79F15]">
              Runner Up
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold font-heading text-[#1A110A] tracking-tight">
              Hackathons
            </span>
          </div>
        )}

        <h3 className="text-base sm:text-lg font-semibold text-[#1A110A] leading-snug">
          {label}
        </h3>

        {description && (
          <p className="text-xs sm:text-sm text-[#6F6B60] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Footer Link / Indicator */}
      <div className="pt-3 border-t border-[#9F9B90]/20 flex items-center justify-between">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={linkText || "View profile"}
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#1A110A] hover:text-[#F79F15] transition-colors group/link min-h-[44px]"
          >
            <span>{linkText || "View profile"}</span>
            <FiExternalLink className="text-sm transition-transform group-hover/link:translate-x-0.5" />
          </a>
        ) : (
          <span />
        )}

        <div
          className="w-2 h-2 rounded-full ml-auto bg-[#F79F15]"
        />
      </div>
    </motion.div>
  );
}

