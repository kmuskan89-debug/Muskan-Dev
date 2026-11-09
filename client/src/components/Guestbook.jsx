import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import api from "../lib/api";
import { useLenis } from "./SmoothScroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Helper: Deterministic hash function to derive rotation, color fill and pin from entry ID
function getDeterministicProps(id, index = 0) {
  const str = String(id || index);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // Rotation: deterministic float between -4.0 and +4.0 degrees
  const rotation = (((absHash % 81) - 40) / 10).toFixed(1);

  // 4 allowed fills:
  // 0: white (ink text)
  // 1: light fill #F8F5EE (ink text)
  // 2: orange #F79F15 (ink text)
  // 3: ink #1A110A (cream text)
  const fillIndex = absHash % 4;

  // Pin: small ink or orange circle with tiny highlight
  const pinColor = fillIndex === 3 ? "orange" : fillIndex === 2 ? "ink" : absHash % 2 === 0 ? "orange" : "ink";

  // Idle sway duration (5.0s to 8.0s) and phase delay
  const swayDuration = (5 + (absHash % 31) / 10).toFixed(2);
  const swayDelay = (-((absHash % 50) / 10)).toFixed(2);

  return {
    rotation: parseFloat(rotation),
    fillIndex,
    pinColor,
    swayDuration,
    swayDelay,
  };
}

export default function Guestbook() {
  const lenis = useLenis();
  const shouldReduceMotion = useReducedMotion();

  // Data states
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Form states
  const [formData, setFormData] = useState({ name: "", note: "", hp: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message: "" }
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isFlyingPlane, setIsFlyingPlane] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  // Interactive card states
  const [isDesktop, setIsDesktop] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState(new Set());

  // Refs
  const boardRef = useRef(null);
  const isWallInView = useInView(boardRef, { margin: "100px 0px" });

  // Detect fine pointer for desktop drag (disabled on touch devices)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(hover: hover) and (pointer: fine)");
      setIsDesktop(media.matches);
      const listener = (e) => setIsDesktop(e.matches);
      media.addEventListener?.("change", listener);
      return () => media.removeEventListener?.("change", listener);
    }
  }, []);

  // Fetch approved guestbook entries
  const fetchEntries = useCallback(async () => {
    try {
      const res = await api.get("/guestbook");
      if (res.data && Array.isArray(res.data.data)) {
        setEntries(res.data.data);
        setIsOffline(false);
      } else {
        setEntries([]);
      }
    } catch {
      // Graceful fallback to offline message state, never an error crash
      setEntries([]);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Synchronize Lenis and ScrollTrigger after notes mount or list changes
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        lenis?.resize();
        ScrollTrigger.refresh();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, visibleCount, lenis]);

  // Form input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status) setStatus(null);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot check for bots
    if (formData.hp) {
      if (!shouldReduceMotion) {
        setIsFlyingPlane(true);
      } else {
        setSubmittedSuccess(true);
      }
      setStatus({
        type: "success",
        message: "Thanks! Your note will appear after approval.",
      });
      setFormData({ name: "", note: "", hp: "" });
      return;
    }

    // Client-side validations
    const trimmedName = formData.name.trim();
    const trimmedNote = formData.note.trim();

    if (!trimmedName || !trimmedNote) {
      setShakeKey((k) => k + 1);
      setStatus({
        type: "error",
        message: "Please enter your name and a short note.",
      });
      return;
    }

    if (trimmedNote.length < 3) {
      setShakeKey((k) => k + 1);
      setStatus({
        type: "error",
        message: "Note must be at least 3 characters long.",
      });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await api.post("/guestbook", {
        name: trimmedName,
        note: trimmedNote,
      });

      setStatus({
        type: "success",
        message: res.data?.message || "Thanks! Your note will appear after approval.",
      });
      setFormData({ name: "", note: "", hp: "" });

      if (!shouldReduceMotion) {
        setIsFlyingPlane(true);
      } else {
        setSubmittedSuccess(true);
      }
    } catch (err) {
      setShakeKey((k) => k + 1);
      if (err.response?.status === 429) {
        setStatus({
          type: "error",
          message: "Too many notes submitted. Please wait a moment before trying again.",
        });
      } else if (!err.response || err.code === "ECONNABORTED" || err.message?.includes("Network Error")) {
        setStatus({
          type: "error",
          message: "Server is waking up, please try again in a moment",
        });
      } else if (err.response?.data?.errors?.length) {
        setStatus({
          type: "error",
          message: err.response.data.errors[0].message,
        });
      } else {
        setStatus({
          type: "error",
          message: err.response?.data?.message || "Failed to submit note. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle "Read more" for clamped notes
  const toggleExpand = (id) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    requestAnimationFrame(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
    });
  };

  // Slice latest notes
  const visibleEntries = entries.slice(0, visibleCount);
  const hasMore = entries.length > visibleCount;

  return (
    <div className="w-full mt-24 pt-16 border-t border-[#9F9B90]/30 flex flex-col gap-12">
      {/* Sub-section Header */}
      <div className="flex flex-col gap-2">
        <span className="section-label text-xs tracking-[0.2em]">
          // GUESTBOOK
        </span>
        <h3 className="text-3xl sm:text-4xl font-bold font-heading text-[#1A110A]">
          Leave a Note
        </h3>
        <p className="text-xs sm:text-sm text-[#6F6B60] max-w-xl">
          Drop a friendly note, feedback, or quick greeting. Submissions appear on the wall once approved.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ======================================================== */}
        {/* LEFT: "Write a Note" Blank Sticky Note Card (-2deg)     */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <motion.div
            key={shakeKey}
            initial={shakeKey > 0 ? { x: -6 } : false}
            animate={{ x: 0 }}
            transition={{
              type: "spring",
              stiffness: 600,
              damping: 18,
            }}
            className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl p-7 sm:p-8 -rotate-2 shadow-[0_12px_28px_-6px_rgba(26,17,10,0.12),0_8px_16px_-6px_rgba(26,17,10,0.06)] border border-[#1A110A]/10 transition-transform duration-300 hover:rotate-0"
          >
            {/* Top Center Orange Pin with Highlight */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#F79F15] border border-[#1A110A]/20 shadow-sm flex items-center justify-center z-10"
              aria-hidden="true"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF]/80 translate-x-[-1px] translate-y-[-1px]" />
            </div>

            {/* Paper Plane Flying Animation Overlay */}
            <AnimatePresence>
              {isFlyingPlane && (
                <motion.div
                  initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                  animate={{
                    opacity: [1, 1, 0.9, 0],
                    scale: [1, 0.7, 0.4, 0.15],
                    x: [0, 80, 220, 320],
                    y: [0, -40, -140, -260],
                    rotate: [0, -12, 28, 48],
                  }}
                  transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
                  onAnimationComplete={() => {
                    setIsFlyingPlane(false);
                    setSubmittedSuccess(true);
                  }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center z-30"
                  aria-hidden="true"
                >
                  <svg
                    className="w-16 h-16 text-[#F79F15] drop-shadow-md"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form View OR Success State */}
            {submittedSuccess ? (
              <motion.div
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center gap-4 py-8"
              >
                <div className="w-12 h-12 rounded-full bg-[#F8F5EE] border border-[#1A110A]/10 flex items-center justify-center text-[#F79F15]">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h4 className="font-caveat text-3xl font-bold text-[#1A110A]">
                    Note Pinned!
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6F6B60] max-w-xs leading-relaxed font-body">
                    Thanks! Your note will appear after approval.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedSuccess(false);
                    setStatus(null);
                  }}
                  className="mt-3 text-xs font-mono font-bold uppercase tracking-wider text-[#1A110A] hover:text-[#F79F15] underline cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
                >
                  Pin another note
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Honeypot field for bot protection */}
                <input
                  type="text"
                  name="hp"
                  value={formData.hp}
                  onChange={handleChange}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {/* Card Title & Subtitle */}
                <div className="flex flex-col gap-1 border-b border-[#9F9B90]/25 pb-3">
                  <h4 className="font-caveat text-3xl sm:text-4xl font-bold text-[#1A110A] leading-tight">
                    Leave a note
                  </h4>
                  <p className="text-xs text-[#6F6B60] font-body">
                    Drop a thought, greeting, or feedback to pin on the wall.
                  </p>
                </div>

                {/* Name Field (Paper underline style) */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="gb-name"
                      className="text-xs font-mono font-medium text-[#6F6B60]"
                    >
                      Your Name *
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        formData.name.length >= 70
                          ? "text-[#F79F15] font-bold"
                          : "text-[#9F9B90]"
                      }`}
                    >
                      {formData.name.length}/80
                    </span>
                  </div>
                  <input
                    id="gb-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={80}
                    required
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-transparent border-0 border-b border-[#9F9B90]/40 focus:border-b-2 focus:border-[#F79F15] focus:outline-none py-2 text-sm text-[#1A110A] placeholder:text-[#9F9B90] rounded-none transition-colors focus-visible:ring-0"
                  />
                </div>

                {/* Note Field (Paper underline style) */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="gb-note"
                      className="text-xs font-mono font-medium text-[#6F6B60]"
                    >
                      Your Note *
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        formData.note.length >= 900
                          ? "text-[#F79F15] font-bold"
                          : "text-[#9F9B90]"
                      }`}
                    >
                      {formData.note.length}/1000
                    </span>
                  </div>
                  <textarea
                    id="gb-note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={4}
                    maxLength={1000}
                    required
                    placeholder="Write something memorable..."
                    className="w-full bg-transparent border-0 border-b border-[#9F9B90]/40 focus:border-b-2 focus:border-[#F79F15] focus:outline-none py-2 font-caveat text-[20px] text-[#1A110A] placeholder:text-[#9F9B90] rounded-none resize-none transition-colors leading-[1.3] focus-visible:ring-0"
                  />
                </div>

                {/* Error status notice */}
                <AnimatePresence>
                  {status && status.type === "error" && (
                    <motion.div
                      role="status"
                      aria-live="polite"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2 p-3 rounded-xl bg-[#F8F5EE] border border-[#1A110A]/15 text-xs text-[#1A110A]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15] mt-1.5 shrink-0" />
                      <span>{status.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button: "Pin it" (Ink pill with round orange icon) */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 min-h-[44px] rounded-full font-mono text-xs font-bold uppercase tracking-wider text-[#F5F3E7] bg-[#1A110A] hover:bg-[#F79F15] hover:text-[#1A110A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
                >
                  {submitting ? (
                    <>
                      {/* Small spinning pin while sending */}
                      <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      <span>Pinning...</span>
                    </>
                  ) : (
                    <>
                      <span className="w-4 h-4 rounded-full bg-[#F79F15] group-hover:bg-[#1A110A] flex items-center justify-center transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1A110A] group-hover:bg-[#F5F3E7]" />
                      </span>
                      <span>Pin it</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT: The Wall Board with subtle dot grid & pins        */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Header count & status */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-[#6F6B60] tracking-wider">
              Approved Notes ({entries.length})
            </span>
            <span className="text-[11px] font-mono text-[#F79F15] flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15] animate-pulse" />
              Live Wall
            </span>
          </div>

          {/* Board Container */}
          <div
            ref={boardRef}
            className={`relative w-full rounded-3xl border border-[#1A110A]/20 bg-[#F8F5EE] p-5 sm:p-7 min-h-[460px] overflow-hidden ${
              !isWallInView ? "guestbook-sway-paused" : ""
            }`}
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(26, 17, 10, 0.12) 1.5px, transparent 1.5px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Scrollable wrapper: activates when there are more than 6 notes */}
            <div
              data-lenis-prevent={entries.length > 6 ? "true" : undefined}
              className={
                entries.length > 6
                  ? "max-h-[580px] overflow-y-auto overflow-x-hidden guestbook-scroll pr-1.5 sm:pr-2"
                  : ""
              }
            >
              {loading ? (
                // 6. Loading: 4 paper-shaped skeletons softly pulsing
                <div className="columns-1 sm:columns-2 gap-5 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`break-inside-avoid mb-5 p-6 rounded-2xl bg-[#FFFFFF] border border-[#1A110A]/10 shadow-sm animate-pulse flex flex-col gap-3.5 ${
                      i % 2 === 0 ? "rotate-1" : "-rotate-1"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-[#F79F15]/40 mx-auto" />
                    <div className="space-y-2">
                      <div className="h-4 bg-[#F8F5EE] rounded w-5/6" />
                      <div className="h-4 bg-[#F8F5EE] rounded w-full" />
                      <div className="h-4 bg-[#F8F5EE] rounded w-3/5" />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#1A110A]/5">
                      <div className="h-3 bg-[#F8F5EE] rounded w-20" />
                      <div className="h-3 bg-[#F8F5EE] rounded w-14" />
                    </div>
                  </div>
                ))}
              </div>
            ) : entries.length === 0 ? (
              // 7. Empty or Offline: 3 empty dashed note slots
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full py-8">
                {[0, 1, 2].map((slotIdx) => (
                  <div
                    key={slotIdx}
                    className={`rounded-2xl border-2 border-dashed border-[#9F9B90]/40 p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[170px] ${
                      slotIdx === 0
                        ? "-rotate-2"
                        : slotIdx === 1
                        ? "rotate-1"
                        : "-rotate-1"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full border border-dashed border-[#9F9B90]/60" />
                    {slotIdx === 1 ? (
                      <p className="text-xs sm:text-sm font-mono text-[#6F6B60] max-w-[200px] leading-relaxed">
                        {isOffline
                          ? "Notes will show up here when the server wakes up"
                          : "Be the first to leave a note"}
                      </p>
                    ) : (
                      <span className="text-[11px] font-mono text-[#9F9B90]/60 uppercase tracking-wider">
                        // Slot {slotIdx + 1}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Masonry Sticky-Note Wall
              <motion.ul
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: shouldReduceMotion ? 0 : 0.07,
                    },
                  },
                }}
                className="columns-1 sm:columns-2 gap-5 w-full list-none p-0 m-0"
              >
                {visibleEntries.map((entry, idx) => {
                  const entryId = entry._id || entry.id || String(idx);
                  const { rotation, fillIndex, pinColor, swayDuration, swayDelay } =
                    getDeterministicProps(entryId, idx);

                  // 4 fill variations
                  const fillClasses =
                    fillIndex === 0
                      ? "bg-[#FFFFFF] text-[#1A110A] border border-[#1A110A]/10 shadow-[0_4px_14px_-2px_rgba(26,17,10,0.08)]"
                      : fillIndex === 1
                      ? "bg-[#F8F5EE] text-[#1A110A] border border-[#1A110A]/10 shadow-[0_4px_14px_-2px_rgba(26,17,10,0.08)]"
                      : fillIndex === 2
                      ? "bg-[#F79F15] text-[#1A110A] border border-[#1A110A]/15 shadow-[0_4px_16px_-2px_rgba(247,159,21,0.25)]"
                      : "bg-[#1A110A] text-[#F5F3E7] border border-[#F5F3E7]/15 shadow-[0_6px_18px_-2px_rgba(26,17,10,0.35)]";

                  const authorColorClass =
                    fillIndex === 3 ? "text-[#F5F3E7]" : "text-[#1A110A]";
                  const dateColorClass =
                    fillIndex === 3
                      ? "text-[#F5F3E7]/70"
                      : fillIndex === 2
                      ? "text-[#1A110A]/70"
                      : "text-[#6F6B60]";

                  const isExpanded = expandedNotes.has(entryId);
                  const isLongNote = entry.note && entry.note.length > 200;

                  return (
                    <motion.li
                      key={entryId}
                      variants={{
                        hidden: shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: -45, scale: 0.9 },
                        visible: shouldReduceMotion
                          ? { opacity: 1 }
                          : {
                              opacity: 1,
                              y: 0,
                              scale: [0.9, 1.04, 0.98, 1],
                              transition: {
                                type: "spring",
                                stiffness: 280,
                                damping: 20,
                              },
                            },
                      }}
                      drag={isDesktop && !shouldReduceMotion}
                      dragConstraints={boardRef}
                      dragElastic={0.12}
                      dragMomentum={false}
                      onDragStart={() => setDraggedId(entryId)}
                      onDragEnd={() => setDraggedId(null)}
                      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                      className="break-inside-avoid mb-5 inline-block w-full relative touch-pan-y"
                      style={{
                        zIndex: draggedId === entryId ? 50 : 1,
                      }}
                    >
                      {/* Inner Note Paper Card (handles idle sway, tilt, hover) */}
                      <div
                        className={`guestbook-note-inner ${
                          !shouldReduceMotion ? "guestbook-note-sway" : ""
                        } rounded-2xl p-5 sm:p-6 flex flex-col gap-3 relative select-none ${fillClasses}`}
                        style={{
                          "--base-rot": `${rotation}deg`,
                          "--sway-dur": `${swayDuration}s`,
                          "--sway-delay": `${swayDelay}s`,
                          cursor: isDesktop && !shouldReduceMotion ? "grab" : "default",
                        }}
                      >
                        {/* Top Center Pin with tiny highlight */}
                        <div
                          className={`w-3.5 h-3.5 rounded-full mx-auto relative shadow-sm shrink-0 ${
                            pinColor === "orange"
                              ? "bg-[#F79F15] border border-[#1A110A]/20"
                              : "bg-[#1A110A] border border-[#9F9B90]/40"
                          }`}
                          aria-hidden="true"
                        >
                          <div className="w-1 h-1 rounded-full bg-[#FFFFFF]/80 absolute top-0.5 left-0.5" />
                        </div>

                        {/* Note text in Caveat font, line-clamp to 8 lines if long */}
                        <p
                          className={`font-caveat text-[20px] leading-[1.3] whitespace-pre-wrap break-words overflow-hidden ${
                            !isExpanded && isLongNote ? "line-clamp-8" : ""
                          }`}
                        >
                          {entry.note}
                        </p>

                        {/* Read more / Show less toggle */}
                        {isLongNote && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(entryId)}
                            className={`self-start text-[11px] font-mono font-semibold underline cursor-pointer -mt-1 focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2 ${authorColorClass}`}
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}

                        {/* Author & Date Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-current/10">
                          <span
                            className={`font-body text-xs sm:text-sm font-bold tracking-tight truncate max-w-[65%] ${authorColorClass}`}
                          >
                            - {entry.name}
                          </span>

                          <time
                            dateTime={entry.createdAt || ""}
                            className={`text-[11px] font-mono shrink-0 ${dateColorClass}`}
                          >
                            {entry.createdAt
                              ? new Date(entry.createdAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Recently"}
                          </time>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}

            {/* Client-side "Show more" button */}
            {!loading && hasMore && (
              <div className="flex justify-center mt-6 pt-4 border-t border-[#1A110A]/10">
                <button
                  type="button"
                  onClick={() => {
                    setVisibleCount((c) => c + 12);
                    requestAnimationFrame(() => {
                      lenis?.resize();
                      ScrollTrigger.refresh();
                    });
                  }}
                  className="px-5 py-2.5 min-h-[44px] rounded-full bg-[#1A110A] text-[#F5F3E7] hover:bg-[#F79F15] hover:text-[#1A110A] font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
                >
                  Show more notes ({entries.length - visibleCount} remaining)
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
