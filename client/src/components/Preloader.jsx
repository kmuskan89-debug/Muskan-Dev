import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLenis } from "./SmoothScroll";

const TYPE_MS_PER_CHAR = 55;   // typing speed, lower = faster
const HOLD_MS = 1200;          // full text stays still so it can be read
const FLICKER_MS = 900;        // flicker duration after the text is complete
const REVEAL_MS = 1000;        // how slowly the site is revealed after the flicker

const FULL_TEXT = "ERROR 404: Conventional developer not found.";
const SAFETY_TIMEOUT_MS = 8000;

const GLITCH_GLYPHS = "!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789";

function getRandomGlyph() {
  return GLITCH_GLYPHS[Math.floor(Math.random() * GLITCH_GLYPHS.length)];
}

export default function Preloader({ onComplete }) {
  const shouldReduceMotion = useReducedMotion();
  const lenis = useLenis();
  const skipBtnRef = useRef(null);

  const [isDone, setIsDone] = useState(false);
  const [typedText, setTypedText] = useState(shouldReduceMotion ? FULL_TEXT : "");
  const [isFlickering, setIsFlickering] = useState(false);
  const [flickerGlitchText, setFlickerGlitchText] = useState(FULL_TEXT);
  const [isRevealing, setIsRevealing] = useState(false);
  const [fadeDuration, setFadeDuration] = useState(REVEAL_MS);

  // Store callbacks and instances in refs so changes never restart the sequence effect
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const hasRevealedRef = useRef(false);
  const timeoutsRef = useRef([]);

  // Helper to remove static HTML overlay from index.html
  const removeStaticOverlay = () => {
    const el = document.getElementById("intro-static-overlay");
    if (el) el.remove();
  };

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    lenisRef.current?.start();
  }, []);

  const startReveal = useCallback(
    (durationMs = REVEAL_MS) => {
      if (hasRevealedRef.current) return;
      hasRevealedRef.current = true;

      // Clear sequence timeouts so nothing fires after reveal starts
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];

      setIsFlickering(false);
      setFadeDuration(durationMs);
      setIsRevealing(true);

      // Unlock scrolling and resume Lenis immediately when fade STARTS
      unlockScroll();

      // Start Hero reveal animation when fade STARTS
      onCompleteRef.current?.();

      // Remove overlay from DOM and remove static overlay only after fade finishes
      const cleanupTimer = setTimeout(() => {
        removeStaticOverlay();
        unlockScroll();
        setIsDone(true);
      }, durationMs);
      timeoutsRef.current.push(cleanupTimer);
    },
    [unlockScroll]
  );

  const handleSkip = useCallback(() => {
    if (isDone) return;
    if (hasRevealedRef.current) {
      // If already in the middle of a slow fade, finish immediately
      removeStaticOverlay();
      unlockScroll();
      setIsDone(true);
      return;
    }
    // Skip, Enter, Space or Escape fades out quickly (about 300ms)
    startReveal(300);
  }, [isDone, startReveal, unlockScroll]);

  // Synchronize Lenis state when lenis instance mounts
  useEffect(() => {
    if (!lenis) return;
    if (hasRevealedRef.current || isDone) {
      lenis.start();
    } else {
      lenis.stop();
    }
  }, [lenis, isDone]);

  // Dynamic character glitch & scramble during the flicker phase
  useEffect(() => {
    if (!isFlickering || shouldReduceMotion) {
      setFlickerGlitchText(FULL_TEXT);
      return;
    }

    const interval = setInterval(() => {
      const chars = FULL_TEXT.split("");
      // Pick 2-4 random characters to glitch into terminal glyphs
      const glitchCount = Math.floor(Math.random() * 3) + 2;
      for (let k = 0; k < glitchCount; k++) {
        const idx = Math.floor(Math.random() * chars.length);
        if (chars[idx] !== " " && chars[idx] !== ":") {
          chars[idx] = getRandomGlyph();
        }
      }
      setFlickerGlitchText(chars.join(""));
    }, 65);

    return () => {
      clearInterval(interval);
      setFlickerGlitchText(FULL_TEXT);
    };
  }, [isFlickering, shouldReduceMotion]);

  // Main animation sequence
  useEffect(() => {
    if (hasRevealedRef.current) {
      unlockScroll();
      return;
    }

    // Lock page scrolling and pause Lenis while playing
    document.body.style.overflow = "hidden";
    lenisRef.current?.stop();

    // Focus Skip button first without trapping focus
    const focusTimer = setTimeout(() => {
      skipBtnRef.current?.focus();
    }, 40);
    timeoutsRef.current.push(focusTimer);

    // Keyboard controls: Click, Enter, Space or Escape ends intro at once (fading out over ~300ms)
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Hard safety timeout: 8 seconds forces exit under any circumstance
    const safetyTimer = setTimeout(() => {
      if (!hasRevealedRef.current) {
        startReveal(300);
      }
    }, SAFETY_TIMEOUT_MS);
    timeoutsRef.current.push(safetyTimer);

    if (shouldReduceMotion) {
      // Reduced motion: no typing, no glitch, no flicker: show full text for 1.5 seconds, then fade out over REVEAL_MS
      const rmTimer = setTimeout(() => {
        startReveal(REVEAL_MS);
      }, 1500);
      timeoutsRef.current.push(rmTimer);

      return () => {
        timeoutsRef.current.forEach((t) => clearTimeout(t));
        window.removeEventListener("keydown", handleKeyDown);
        unlockScroll();
        removeStaticOverlay();
      };
    }

    // 1. Typing with character glitch & scrambling at leading edge
    const totalChars = FULL_TEXT.length;
    const typingDuration = totalChars * TYPE_MS_PER_CHAR;
    const tickMs = Math.round(TYPE_MS_PER_CHAR / 2);
    let charIndex = 0;
    let tickCount = 0;

    const typeInterval = setInterval(() => {
      tickCount++;

      if (tickCount % 2 === 0) {
        charIndex++;
      }

      if (charIndex >= totalChars) {
        clearInterval(typeInterval);
        setTypedText(FULL_TEXT);
        return;
      }

      const resolved = FULL_TEXT.slice(0, charIndex);
      const nextChar = FULL_TEXT[charIndex];
      const glitchChar = nextChar === " " ? " " : getRandomGlyph();
      setTypedText(resolved + glitchChar);
    }, tickMs);

    // 2. Hold: keep COMPLETE text on screen for HOLD_MS
    // 3. Flicker on cream: after hold, characters glitch and flicker for FLICKER_MS
    const flickerTimer = setTimeout(() => {
      setIsFlickering(true);
    }, typingDuration + HOLD_MS);
    timeoutsRef.current.push(flickerTimer);

    // 4. Reveal: when flicker ends, start slow fade out over REVEAL_MS (homepage slowly reveals)
    const revealTimer = setTimeout(() => {
      startReveal(REVEAL_MS);
    }, typingDuration + HOLD_MS + FLICKER_MS);
    timeoutsRef.current.push(revealTimer);

    return () => {
      clearInterval(typeInterval);
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      window.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
      removeStaticOverlay();
    };
  }, [shouldReduceMotion, handleSkip, startReveal, unlockScroll]);

  if (isDone) {
    return null;
  }

  // Active text: during the flicker phase, show character-glitched text; otherwise show typed text
  const activeText = isFlickering && !shouldReduceMotion ? flickerGlitchText : typedText;

  return (
    <motion.div
      key="intro-overlay"
      role="presentation"
      aria-hidden="true"
      initial={{ opacity: 1 }}
      animate={
        isRevealing
          ? { opacity: 0 }
          : isFlickering
          ? {
              backgroundColor: [
                "#F5F3E7",
                "#EBE7D6",
                "#F5F3E7",
                "#EBE7D6",
                "#F5F3E7",
                "#EBE7D6",
                "#F5F3E7",
              ],
              opacity: 1,
            }
          : { backgroundColor: "var(--bg-color, #F5F3E7)", opacity: 1 }
      }
      transition={
        isRevealing
          ? { duration: fadeDuration / 1000, ease: "easeInOut" }
          : { duration: FLICKER_MS / 1000, ease: "linear" }
      }
      style={{
        backgroundColor: "var(--bg-color, #F5F3E7)",
      }}
      className={`fixed inset-0 z-[100000] flex items-center justify-center p-6 sm:p-10 select-none overflow-hidden ${
        isRevealing ? "pointer-events-none" : ""
      }`}
    >
      {/* Centered Typography: Ink #1A110A, bold monospace, character glitch shake during flicker, smooth fade-out during reveal */}
      <motion.div
        animate={
          isRevealing
            ? { opacity: 0, y: shouldReduceMotion ? 0 : -12, x: 0 }
            : isFlickering
            ? {
                opacity: [1, 0.65, 1, 0.6, 1, 0.68, 1],
                x: shouldReduceMotion ? 0 : [0, -3, 3, -2, 2, -1, 1, 0],
                y: 0,
              }
            : { opacity: 1, x: 0, y: 0 }
        }
        transition={
          isRevealing
            ? {
                opacity: { duration: Math.min(fadeDuration / 1000, 0.25), ease: "easeOut" },
                y: { duration: fadeDuration / 1000, ease: "easeInOut" },
              }
            : { duration: FLICKER_MS / 1000, ease: "linear" }
        }
        style={{
          fontFamily: '"JetBrains Mono", ui-monospace, Consolas, "Courier New", monospace',
          fontWeight: 700,
          fontSize: "clamp(1.75rem, 5.5vw, 5.5rem)",
          lineHeight: 1.6,
          maxWidth: "26ch",
          textShadow:
            isFlickering && !shouldReduceMotion
              ? "2px 0 #F79F15, -2px 0 rgba(26, 17, 10, 0.5)"
              : "none",
        }}
        className="w-full text-center text-[#1A110A] tracking-tight break-words select-none"
      >
        <span>{activeText}</span>
        {/* Blinking block cursor in accent orange #F79F15 */}
        <span
          aria-hidden="true"
          className="inline-block w-[0.55em] h-[0.9em] bg-[#F79F15] ml-1.5 align-baseline animate-pulse"
        />
      </motion.div>

      {/* Small, subtle Skip button at bottom right (ink at ~70% opacity, ink outline + orange offset focus ring) */}
      <button
        ref={skipBtnRef}
        type="button"
        onClick={handleSkip}
        aria-label="Skip intro animation"
        className={`fixed bottom-6 right-6 z-[100001] px-3.5 py-1.5 rounded-full text-xs font-mono text-[#1A110A]/70 hover:text-[#1A110A] bg-[#1A110A]/5 hover:bg-[#1A110A]/10 border border-[#1A110A]/20 hover:border-[#1A110A]/40 backdrop-blur-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1A110A] focus:ring-offset-2 focus:ring-offset-[#F79F15] ${
          isRevealing ? "opacity-0 pointer-events-none transition-opacity duration-200" : ""
        }`}
      >
        Skip ➔
      </button>
    </motion.div>
  );
}
