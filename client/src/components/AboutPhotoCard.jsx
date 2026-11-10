import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { personalInfo } from "../data/content";
import { FiWifi, FiRotateCw, FiLock, FiArrowUp } from "react-icons/fi";

/**
 * Interactive Hanging ID Card for the About section.
 * - Starts hanging face-down (showing the back of the developer pass).
 * - Includes a tactile draggable / clickable RFID Scanner Puck element below the card.
 * - Dragging the scanner onto the card (or clicking/tapping it) triggers an RFID scan sweep,
 *   swings the hanging lanyard, and flips the card 180deg to face front and reveal the photo.
 */
export default function AboutPhotoCard() {
  const cardRef = useRef(null);
  const puckRef = useRef(null);
  const dockRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const nudgeTimeoutRef = useRef(null);
  const dragMovedRef = useRef(false);

  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Card states: false = faced backwards (locked), true = faced front (photo revealed)
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isScannerNear, setIsScannerNear] = useState(false);
  const [showBeamFromDock, setShowBeamFromDock] = useState(false);
  const [nudgeScanner, setNudgeScanner] = useState(false);
  const [swingImpulse, setSwingImpulse] = useState(0);

  // 3D hover tilt motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 180 };
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  // Specular sheen position across the card
  const sheenX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const sheenY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (nudgeTimeoutRef.current) clearTimeout(nudgeTimeoutRef.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Trigger the scan sequence and flip the card to front
  const triggerRevealScan = useCallback(
    (withDockBeam = false) => {
      if (isScanning || isRevealed) return;

      setIsScanning(true);
      if (withDockBeam) {
        setShowBeamFromDock(true);
      }

      // Trigger subtle pendulum kick
      setSwingImpulse((prev) => prev + 1);

      const delay = shouldReduceMotion ? 120 : 420;
      scanTimeoutRef.current = setTimeout(() => {
        setIsRevealed(true);
        setIsScanning(false);
        setShowBeamFromDock(false);
        setIsScannerNear(false);
      }, delay);
    },
    [isScanning, isRevealed, shouldReduceMotion]
  );

  // Toggle flip back to face backwards
  const handleFlipBack = useCallback(() => {
    if (isScanning) return;
    setSwingImpulse((prev) => prev + 1);
    setIsRevealed(false);
  }, [isScanning]);

  // Check if dragged scanner puck overlaps the hanging ID card
  const checkScannerOverlap = useCallback(() => {
    if (!cardRef.current || !puckRef.current) return false;
    const cardRect = cardRef.current.getBoundingClientRect();
    const puckRect = puckRef.current.getBoundingClientRect();
    const cx = puckRect.left + puckRect.width / 2;
    const cy = puckRect.top + puckRect.height / 2;

    return (
      cx >= cardRect.left - 18 &&
      cx <= cardRect.right + 18 &&
      cy >= cardRect.top - 18 &&
      cy <= cardRect.bottom + 18
    );
  }, []);

  const handlePuckDragStart = () => {
    dragMovedRef.current = false;
  };

  const handlePuckDrag = (_, info) => {
    if (Math.hypot(info.offset.x, info.offset.y) > 8) {
      dragMovedRef.current = true;
    }
    const over = checkScannerOverlap();
    setIsScannerNear(over);
    if (over && !isRevealed && !isScanning) {
      triggerRevealScan(false);
    }
  };

  const handlePuckDragEnd = () => {
    const over = checkScannerOverlap();
    if (over && !isRevealed && !isScanning) {
      triggerRevealScan(false);
    }
    setIsScannerNear(false);
  };

  const handlePuckClick = () => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    if (!isRevealed) {
      triggerRevealScan(true);
    } else {
      handleFlipBack();
    }
  };

  // If user clicks the locked card directly, nudge & highlight the scanner below
  const handleLockedCardClick = () => {
    if (!isRevealed && !isScanning) {
      setNudgeScanner(true);
      setSwingImpulse((prev) => prev + 1);
      if (nudgeTimeoutRef.current) clearTimeout(nudgeTimeoutRef.current);
      nudgeTimeoutRef.current = setTimeout(() => setNudgeScanner(false), 1400);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[380px] mx-auto select-none">
      {/* Subtle Ambient Background Glow */}
      <div
        aria-hidden="true"
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-80 rounded-full blur-[90px] pointer-events-none transition-colors duration-700 ${
          isRevealed ? "bg-[#F79F15]/18" : "bg-[#1A110A]/8"
        }`}
      />

      {/* ============================================================ */}
      {/* 1. LANYARD ANCHOR PIN & HANGING PENDULUM ASSEMBLY            */}
      {/* ============================================================ */}
      <div className="relative flex flex-col items-center w-full">
        {/* Top Mounting Pin */}
        <div className="relative z-30 flex items-center justify-center w-6 h-6 rounded-full bg-[#1A110A] border-2 border-[#FFFFFF] shadow-md">
          <div className="w-2 h-2 rounded-full bg-[#F79F15]" />
        </div>

        {/* Pendulum Container (Swings gently from top pin) */}
        <motion.div
          key={`swing-${swingImpulse}`}
          animate={
            shouldReduceMotion
              ? { rotate: 0 }
              : {
                  rotate:
                    swingImpulse > 0
                      ? [0, -3.5, 2.8, -1.6, 0.8, 0]
                      : [-1.1, 1.1, -1.1],
                }
          }
          transition={
            swingImpulse > 0
              ? { duration: 1.5, ease: "easeOut" }
              : { repeat: Infinity, duration: 5.8, ease: "easeInOut" }
          }
          style={{ transformOrigin: "top center", perspective: 1200 }}
          className="relative flex flex-col items-center -mt-2"
        >
          {/* V-Shaped Lanyard Strap + Metal Swivel Clasp */}
          <div className="relative z-20 flex flex-col items-center pointer-events-none">
            <svg
              width="96"
              height="64"
              viewBox="0 0 96 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="drop-shadow-sm"
            >
              {/* Left & Right Lanyard Ribbons */}
              <path
                d="M48 2 L24 46 L34 46 L48 16 Z"
                fill="#1A110A"
              />
              <path
                d="M48 2 L72 46 L62 46 L48 16 Z"
                fill="#1A110A"
              />
              {/* Orange Center Stitch Accents */}
              <path
                d="M48 6 L29 44"
                stroke="#F79F15"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <path
                d="M48 6 L67 44"
                stroke="#F79F15"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Metal Ring / Swivel Collar */}
              <rect
                x="35"
                y="42"
                width="26"
                height="8"
                rx="4"
                fill="#9F9B90"
                stroke="#1A110A"
                strokeWidth="1.5"
              />
              {/* Clip Hook into ID Slot */}
              <rect
                x="43"
                y="48"
                width="10"
                height="16"
                rx="3"
                fill="#FFFFFF"
                stroke="#1A110A"
                strokeWidth="1.8"
              />
              <circle cx="48" cy="56" r="2" fill="#F79F15" />
            </svg>
          </div>

          {/* ======================================================== */}
          {/* 2. TWO-SIDED 3D HANGING ID CARD                          */}
          {/* ======================================================== */}
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleLockedCardClick}
            style={
              isMobile || shouldReduceMotion
                ? { transformStyle: "preserve-3d" }
                : {
                    rotateX: tiltX,
                    rotateY: tiltY,
                    transformStyle: "preserve-3d",
                  }
            }
            animate={{
              scale: isScannerNear ? 1.03 : 1,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative -mt-3 w-[292px] sm:w-[340px] h-[400px] sm:h-[464px] cursor-pointer"
          >
            {/* Rotating Inner Wrapper (0deg = Back Face, 180deg = Front Face) */}
            <motion.div
              animate={{
                rotateY: isRevealed ? 180 : 0,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.25 }
                  : {
                      type: "spring",
                      stiffness: 95,
                      damping: 14,
                      mass: 0.9,
                    }
              }
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full h-full"
            >
              {/* ==================================================== */}
              {/* BACK FACE (Default: Faced Backwards)                 */}
              {/* ==================================================== */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(0deg) translateZ(1px)",
                }}
                className={`absolute inset-0 rounded-[24px] bg-[#FFFFFF] border-2 transition-colors duration-300 shadow-xl overflow-hidden flex flex-col justify-between ${
                  isScannerNear || isScanning
                    ? "border-[#F79F15] ring-4 ring-[#F79F15]/25"
                    : "border-[#1A110A]"
                }`}
              >
                {/* Punch-hole Slot at Top */}
                <div className="pt-3.5 flex justify-center">
                  <div className="w-12 h-2.5 rounded-full bg-[#F5F3E7] border border-[#1A110A]/40" />
                </div>

                {/* Magnetic Security Stripe */}
                <div className="w-full h-11 bg-[#1A110A] mt-3" />

                {/* Center RFID Chip & Target Zone */}
                <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-4 bg-[#F8F5EE] m-4 rounded-2xl border border-dashed border-[#1A110A]/25 overflow-hidden">
                  {/* Subtle dot grid texture */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-35 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(#9F9B90 1px, transparent 1px)",
                      backgroundSize: "14px 14px",
                    }}
                  />

                  {/* Orange RFID Chip */}
                  <div className="relative z-10 flex flex-col items-center gap-3.5">
                    <div
                      className={`relative w-20 h-14 rounded-xl border-2 border-[#1A110A] flex items-center justify-center shadow-sm transition-all duration-300 ${
                        isScannerNear || isScanning
                          ? "bg-[#F79F15] scale-110"
                          : "bg-[#F79F15]/85"
                      }`}
                    >
                      {/* Chip Circuit Lines */}
                      <svg
                        width="52"
                        height="34"
                        viewBox="0 0 44 28"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect
                          x="1"
                          y="1"
                          width="42"
                          height="26"
                          rx="4"
                          stroke="#1A110A"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M15 1V27M29 1V27M1 14H15M29 14H43M15 8H29M15 20H29"
                          stroke="#1A110A"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#1A110A]/15 shadow-xs">
                      <FiLock className="text-[#F79F15] text-xs" />
                      <span className="font-mono text-[11px] font-bold tracking-wider text-[#1A110A] uppercase">
                        {isScanning ? "Scanning..." : "Scan to Reveal"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Vector Barcode Strip */}
                <div className="px-5 pb-4 pt-1 flex items-center justify-center">
                  <div
                    aria-hidden="true"
                    className="flex items-end gap-[2.5px] h-7 opacity-80"
                  >
                    {[2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 3, 1, 2, 1, 2].map((w, idx) => (
                      <span
                        key={idx}
                        style={{ width: `${w}px` }}
                        className="h-full bg-[#1A110A] rounded-[0.5px]"
                      />
                    ))}
                  </div>
                </div>

                {/* Animated Laser Scan Line Overlay */}
                <AnimatePresence>
                  {(isScanning || isScannerNear) && (
                    <motion.div
                      initial={{ top: "10%", opacity: 0 }}
                      animate={{
                        top: ["12%", "88%", "12%"],
                        opacity: 1,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute left-3 right-3 h-1 rounded-full bg-[#F79F15] shadow-[0_0_16px_4px_rgba(247,159,21,0.75)] z-30 pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* ==================================================== */}
              {/* FRONT FACE (Full-Bleed Photo Only - Zero Details)    */}
              {/* ==================================================== */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg) translateZ(1px)",
                }}
                className="absolute inset-0 rounded-[24px] bg-[#F8F5EE] border-2 border-[#1A110A] shadow-2xl overflow-hidden"
              >
                {/* Full-Bleed Portrait Photo */}
                <img
                  src="/me.webp"
                  alt={personalInfo.name}
                  draggable={false}
                  className="w-full h-full object-cover object-[center_20%]"
                />

                {/* Subtle Punch-hole Slot Cutout at Top so ID card clip silhouette stays realistic */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-2.5 rounded-full bg-[#F5F3E7]/90 border border-[#1A110A]/45 shadow-xs pointer-events-none z-10" />

                {/* Specular light sheen on tilt */}
                {!shouldReduceMotion && (
                  <motion.div
                    aria-hidden="true"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(255,255,255,0.22) 0%, transparent 65%)",
                      left: sheenX,
                      top: sheenY,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none mix-blend-overlay"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* 3. INTERACTIVE RFID SCANNER ELEMENT (Dock + Draggable Puck)  */}
      {/* ============================================================ */}
      <div className="relative z-30 mt-5 w-full flex flex-col items-center">
        {/* Visual Scan Beam connecting dock -> card on click */}
        <AnimatePresence>
          {showBeamFromDock && (
            <motion.div
              initial={{ scaleY: 0, opacity: 0.9 }}
              animate={{ scaleY: 1, opacity: [0.9, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{ transformOrigin: "bottom center" }}
              className="absolute -top-24 w-24 h-24 bg-gradient-to-t from-[#F79F15]/45 via-[#F79F15]/15 to-transparent blur-[2px] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Scanner Dock Base */}
        <div
          ref={dockRef}
          className={`relative w-full max-w-[292px] sm:max-w-[340px] rounded-2xl p-2.5 bg-[#F8F5EE] border transition-all duration-300 shadow-sm flex items-center justify-between gap-3 ${
            nudgeScanner
              ? "border-[#F79F15] ring-4 ring-[#F79F15]/30 scale-[1.03]"
              : "border-[#1A110A]/20"
          }`}
        >
          {/* Draggable / Clickable Scanner Key Puck */}
          <motion.button
            ref={puckRef}
            type="button"
            drag={!shouldReduceMotion}
            dragSnapToOrigin
            dragElastic={0.18}
            dragMomentum={false}
            onDragStart={handlePuckDragStart}
            onDrag={handlePuckDrag}
            onDragEnd={handlePuckDragEnd}
            onClick={handlePuckClick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            whileDrag={{ scale: 1.1, zIndex: 50, cursor: "grabbing" }}
            aria-label={
              isRevealed
                ? "Flip ID card back to face backwards"
                : "Drag scanner onto ID card or click to scan and reveal photo"
            }
            className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold shadow-md transition-colors cursor-grab active:cursor-grabbing shrink-0 ${
              isRevealed
                ? "bg-[#1A110A] text-[#F5F3E7] hover:bg-[#1A110A]/90"
                : "bg-[#F79F15] text-[#1A110A] hover:bg-[#F79F15]/90"
            }`}
          >
            {isRevealed ? (
              <>
                <FiRotateCw className="text-sm text-[#F79F15]" />
                <span>Flip Back</span>
              </>
            ) : (
              <>
                <FiWifi className="text-sm rotate-90" />
                <span>{isScanning ? "Scanning..." : "ID Scanner"}</span>
              </>
            )}
          </motion.button>

          {/* Instruction / Status Caption */}
          <div className="flex flex-col text-right pr-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A110A] flex items-center justify-end gap-1">
              {!isRevealed && !isScanning && (
                <FiArrowUp className="text-[#F79F15] animate-bounce" />
              )}
              {isRevealed ? "Photo Unlocked" : "Drag up or Tap"}
            </span>
            <span className="font-mono text-[9px] text-[#6F6B60]">
              {isRevealed ? "Front side facing" : "To reveal front"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
