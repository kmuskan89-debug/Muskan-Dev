import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import api from "../lib/api";
import { useLenis } from "../components/SmoothScroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnetic from "../components/Magnetic";
import { personalInfo } from "../data/content";

// Lazy-load Guestbook sub-section
const Guestbook = lazy(() => import("../components/Guestbook"));

// Icons
import {
  FiMail,
  FiLinkedin,
  FiGithub,
  FiMapPin,
  FiCopy,
  FiCheck,
  FiSend,
  FiDownload,
  FiArrowUpRight,
  FiClock,
} from "react-icons/fi";
import { SiLeetcode } from "react-icons/si";

export default function Contact() {
  const lenis = useLenis();
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const isSectionInView = useInView(sectionRef, { margin: "100px 0px" });

  // Live Local Time in Banur, Punjab (IST)
  const [localTime, setLocalTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        setLocalTime(`${formatter.format(new Date())} IST`);
      } catch {
        setLocalTime("");
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Sync layout after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
    }, 200);
    return () => clearTimeout(timer);
  }, [lenis]);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    hp: "", // Honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [isPlaneFlying, setIsPlaneFlying] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message: "" }
  const [shakeKey, setShakeKey] = useState(0);
  const [copiedField, setCopiedField] = useState(null); // "email" | "phone" | null

  // Focus tracking for floating labels
  const [focusedField, setFocusedField] = useState(null);

  // Copy to clipboard handler
  const handleCopy = (text, field) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status) setStatus(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Please enter your name.";
    if (!formData.email.trim()) return "Please enter your email address.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }
    if (!formData.message.trim()) return "Please enter a message.";
    if (formData.message.trim().length < 5) {
      return "Message must be at least 5 characters long.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot check for bots
    if (formData.hp) {
      setSubmittedSuccess(true);
      setStatus({
        type: "success",
        message: "Thank you for reaching out! Your message has been sent successfully.",
      });
      setFormData({ name: "", email: "", subject: "", message: "", hp: "" });
      return;
    }

    const error = validateForm();
    if (error) {
      setShakeKey((k) => k + 1);
      setStatus({ type: "error", message: error });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    if (!shouldReduceMotion) {
      setIsPlaneFlying(true);
    }

    try {
      const res = await api.post("/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setSubmittedSuccess(true);
      setStatus({
        type: "success",
        message:
          res.data?.message ||
          "Thank you for reaching out! Your message has been sent successfully.",
      });
      setFormData({ name: "", email: "", subject: "", message: "", hp: "" });
    } catch (err) {
      setShakeKey((k) => k + 1);
      if (err.response?.status === 429) {
        setStatus({
          type: "error",
          message: "Too many requests. Please wait a moment before sending another message.",
        });
      } else if (
        !err.response ||
        err.code === "ECONNABORTED" ||
        err.message?.includes("Network Error")
      ) {
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
          message:
            err.response?.data?.message ||
            "Unable to send message right now. Please try again or email directly.",
        });
      }
    } finally {
      setSubmitting(false);
      setIsPlaneFlying(false);
    }
  };

  // Contact list rows configuration
  const contactRows = [
    {
      num: "01",
      label: "Email",
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
      isAction: "copy",
      field: "email",
      cursor: "copy",
    },
    {
      num: "02",
      label: "LinkedIn",
      value: (personalInfo.linkedin || "")
        .replace("https://www.", "")
        .replace("https://", ""),
      href: personalInfo.linkedin,
      isAction: "link",
      cursor: "open",
    },
    {
      num: "03",
      label: "GitHub",
      value: (personalInfo.github || "")
        .replace("https://www.", "")
        .replace("https://", ""),
      href: personalInfo.github,
      isAction: "link",
      cursor: "open",
    },
    {
      num: "04",
      label: "LeetCode",
      value: (personalInfo.leetcode || "")
        .replace("https://www.", "")
        .replace("https://", ""),
      href: personalInfo.leetcode,
      isAction: "link",
      cursor: "open",
    },
    {
      num: "05",
      label: "Location",
      value: personalInfo.location || "Banur, Punjab",
      isAction: "none",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen w-full flex flex-col justify-center px-6 py-28 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/4 -right-36 w-96 h-96 bg-[#F79F15]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ======================================================== */}
      {/* HEADING with Rotating Circular "SAY HELLO" Sticker       */}
      {/* ======================================================== */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 },
          },
        }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16"
      >
        <div className="flex flex-col gap-3 max-w-2xl">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 },
            }}
            className="section-label"
          >
            // 05. CONTACT
          </motion.div>
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight text-[#1A110A] leading-[1.08]"
          >
            Let's Build Something <span className="accent-word">Amazing</span> Together.
          </motion.h2>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-sm md:text-base text-[#6F6B60] max-w-xl font-body"
          >
            Whether you have an engineering role, a collaborative project idea, or just want to connect, feel free to reach out.
          </motion.p>
        </div>

        {/* 110px Rotating Circular Sticker */}
        <div className="self-start md:self-center shrink-0">
          <div
            className="relative w-[110px] h-[110px] rounded-full bg-[#F79F15] shadow-md border border-[#1A110A]/15 flex items-center justify-center select-none"
            aria-hidden="true"
          >
            {/* Circular Path Text rotating at 14s/turn */}
            <svg
              viewBox="0 0 110 110"
              className={`w-full h-full absolute inset-0 ${
                !shouldReduceMotion && isSectionInView
                  ? "animate-[spin_14s_linear_infinite]"
                  : ""
              }`}
            >
              <defs>
                <path
                  id="contactCirclePath"
                  d="M 55, 55 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                />
              </defs>
              <text className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] fill-[#1A110A]">
                <textPath href="#contactCirclePath" startOffset="0%">
                  SAY HELLO • SAY HELLO • 
                </textPath>
              </text>
            </svg>

            {/* Inner rotating arrow icon */}
            <div
              className={`w-7 h-7 rounded-full bg-[#1A110A] text-[#F79F15] flex items-center justify-center shadow-inner ${
                !shouldReduceMotion && isSectionInView
                  ? "animate-[spin_14s_linear_infinite]"
                  : ""
              }`}
            >
              <FiArrowUpRight className="text-base" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* MAIN TWO-COLUMN GRID: Left Rows, Right Paper Letter      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* ======================================================== */}
        {/* LEFT: Status Pills, Numbered List Rows, Resume Button    */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Status Line: Two Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Pill 1: Open to opportunities */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#1A110A]/10 text-xs font-mono font-medium text-[#1A110A] shadow-sm">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-[#F79F15] ${
                    !shouldReduceMotion && isSectionInView
                      ? "animate-ping opacity-75"
                      : "opacity-40"
                  }`}
                />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F79F15]" />
              </span>
              <span>Open to opportunities</span>
            </div>

            {/* Pill 2: Banur, Punjab Local Time */}
            {localTime && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#1A110A]/10 text-xs font-mono font-medium text-[#6F6B60] shadow-sm">
                <FiClock className="text-[#F79F15] text-xs shrink-0" />
                <span>Banur, Punjab — {localTime}</span>
              </div>
            )}
          </div>

          {/* Numbered List of Contact Rows */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: shouldReduceMotion ? 0 : 0.06,
                },
              },
            }}
            className="flex flex-col gap-3"
          >
            {contactRows.map((item) => {
              const isActionable = item.isAction !== "none";

              return (
                <motion.div
                  key={item.num}
                  variants={{
                    hidden: shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: -30 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.45, ease: "easeOut" },
                    },
                  }}
                  className="w-full"
                >
                  <div className="group relative rounded-[28px] bg-[#FFFFFF] border border-[#1A110A]/10 px-5 sm:px-6 py-4 shadow-sm transition-all duration-300 md:hover:bg-[#1A110A] md:hover:text-[#F5F3E7] md:focus-within:bg-[#1A110A] md:focus-within:text-[#F5F3E7] flex items-center justify-between gap-4">
                    {/* Left details */}
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                      <span className="font-mono text-xs font-semibold text-[#9F9B90] md:group-hover:text-[#F79F15] md:group-focus-within:text-[#F79F15] transition-colors shrink-0">
                        {item.num}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-heading font-bold text-sm sm:text-base text-[#1A110A] md:group-hover:text-[#F5F3E7] md:group-focus-within:text-[#F5F3E7] transition-colors">
                          {item.label}
                        </span>
                        {isActionable ? (
                          <a
                            href={item.href}
                            target={item.isAction === "link" ? "_blank" : undefined}
                            rel={item.isAction === "link" ? "noopener noreferrer" : undefined}
                            data-cursor={item.cursor}
                            className="font-body text-xs sm:text-sm text-[#6F6B60] md:group-hover:text-[#F5F3E7]/80 md:group-focus-within:text-[#F5F3E7]/80 transition-colors truncate focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2 md:group-focus-within:outline-[#F5F3E7]"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <span className="font-body text-xs sm:text-sm text-[#6F6B60] md:group-hover:text-[#F5F3E7]/80 md:group-focus-within:text-[#F5F3E7]/80 transition-colors truncate">
                            {item.value}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right button with Magnetic */}
                    {isActionable && (
                      <div className="relative shrink-0">
                        <Magnetic strength={0.25}>
                          {item.isAction === "copy" ? (
                            <button
                              type="button"
                              onClick={() => handleCopy(item.value, item.field)}
                              data-cursor="copy"
                              aria-label={`Copy ${item.label}`}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F79F15] text-[#1A110A] flex items-center justify-center transition-transform duration-300 md:group-hover:rotate-45 md:group-focus-within:rotate-45 shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
                            >
                              {copiedField === item.field ? (
                                <FiCheck className="text-base font-bold" />
                              ) : (
                                <FiCopy className="text-sm" />
                              )}
                            </button>
                          ) : (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-cursor="open"
                              aria-label={`Open ${item.label}`}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F79F15] text-[#1A110A] flex items-center justify-center transition-transform duration-300 md:group-hover:rotate-45 md:group-focus-within:rotate-45 shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
                            >
                              <FiArrowUpRight className="text-base" />
                            </a>
                          )}
                        </Magnetic>

                        {/* Copy Toast feedback */}
                        <AnimatePresence>
                          {copiedField === item.field && (
                            <motion.span
                              initial={{ opacity: 0, y: 4, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.9 }}
                              className="absolute -top-7 right-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F79F15] text-[#1A110A] shadow-md pointer-events-none select-none"
                            >
                              Copied!
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Under list: Download Resume Button */}
          <div className="pt-2">
            <a
              href={personalInfo.resume}
              download="Muskan_Kumari_Resume.pdf"
              data-cursor="open"
              className="inline-flex items-center justify-between px-6 py-4 rounded-[28px] font-mono text-xs font-bold uppercase tracking-wider text-[#F5F3E7] bg-[#1A110A] hover:bg-[#F79F15] hover:text-[#1A110A] transition-all duration-300 shadow-sm group w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#9F9B90] group-hover:text-[#1A110A] transition-colors">
                  00
                </span>
                <span>Download Resume</span>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#F79F15] text-[#1A110A] group-hover:bg-[#1A110A] group-hover:text-[#F5F3E7] flex items-center justify-center transition-all duration-300 shadow-sm">
                <FiDownload className="text-sm group-hover:translate-y-0.5 transition-transform" />
              </span>
            </a>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT: The Form as a Paper Letter                        */}
        {/* ======================================================== */}
        <div className="lg:col-span-7">
          <motion.div
            key={shakeKey}
            initial={shakeKey > 0 ? { x: -8 } : shouldReduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            animate={
              submittedSuccess
                ? { y: -8, transition: { duration: 0.4 } }
                : { x: 0 }
            }
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 24,
            }}
            className="relative rounded-3xl bg-[#FFFFFF] border border-[#1A110A]/10 shadow-[0_20px_40px_-15px_rgba(26,17,10,0.12),0_10px_20px_-10px_rgba(26,17,10,0.06)] overflow-hidden lg:-rotate-1 transition-transform duration-300 hover:rotate-0"
          >
            {/* Airmail stripe pattern along top edge (Ink & Orange repeating diagonal) */}
            <div
              className="h-2.5 w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, #1A110A 0, #1A110A 14px, #FFFFFF 14px, #FFFFFF 20px, #F79F15 20px, #F79F15 34px, #FFFFFF 34px, #FFFFFF 40px)",
              }}
              aria-hidden="true"
            />

            <div className="p-7 sm:p-9 relative">
              {/* Header line "To: Muskan Kumari" & Postage Stamp */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#9F9B90]/20">
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] font-bold text-[#6F6B60] uppercase tracking-wider">
                    To: {personalInfo.name}
                  </span>
                  <span className="font-body text-xs text-[#9F9B90]">
                    Banur, Punjab • India
                  </span>
                </div>

                {/* Orange Stamp with envelope icon */}
                <div
                  className="w-10 h-10 rounded-full bg-[#F79F15] border-2 border-dashed border-[#1A110A]/30 flex items-center justify-center text-[#1A110A] shadow-sm rotate-6"
                  aria-hidden="true"
                >
                  <FiMail className="text-base" />
                </div>
              </div>

              {/* Success View OR Active Form */}
              {submittedSuccess ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="py-12 flex flex-col items-center text-center gap-6 relative"
                >
                  {/* Circular "SENT" Postal Stamp with Thump Animation */}
                  <motion.div
                    initial={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { scale: 2.2, opacity: 0, rotate: -24 }
                    }
                    animate={
                      shouldReduceMotion
                        ? { opacity: 1, rotate: -12 }
                        : {
                            scale: [2.2, 0.95, 1.05, 1],
                            opacity: 1,
                            rotate: -12,
                          }
                    }
                    transition={{
                      duration: 0.55,
                      times: [0, 0.6, 0.8, 1],
                      ease: "easeOut",
                    }}
                    className="w-24 h-24 rounded-full border-4 border-double border-[#F79F15] bg-[#F79F15]/15 flex flex-col items-center justify-center text-[#1A110A] select-none shadow-sm"
                  >
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[#F79F15]">
                      • POSTED •
                    </span>
                    <span className="font-heading font-black text-2xl tracking-wider text-[#1A110A] leading-none">
                      SENT
                    </span>
                    <span className="font-mono text-[9px] font-medium tracking-tight text-[#6F6B60]">
                      DELIVERED
                    </span>
                  </motion.div>

                  <div className="space-y-2 max-w-sm">
                    <h3 className="text-2xl font-bold font-heading text-[#1A110A]">
                      Message Received!
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6F6B60] font-body leading-relaxed">
                      Thanks! Your message has been sent. I'll get back to you as soon as possible.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedSuccess(false);
                      setStatus(null);
                    }}
                    className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A110A] hover:text-[#F79F15] underline cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                  {/* Bot Protection Honeypot */}
                  <input
                    type="text"
                    name="hp"
                    value={formData.hp}
                    onChange={handleInputChange}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                    {/* Name Field (Floating label over underline) */}
                    <div className="relative pt-4">
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                        maxLength={100}
                        required
                        className="w-full bg-transparent border-0 border-b border-[#9F9B90]/40 py-2 text-sm text-[#1A110A] rounded-none focus:outline-none transition-colors"
                        aria-describedby={status?.type === "error" ? "contact-form-status" : undefined}
                      />
                      <label
                        htmlFor="contact-name"
                        className={`absolute left-0 pointer-events-none transition-all duration-200 font-mono ${
                          focusedField === "name" || formData.name
                            ? "-top-1 text-[11px] font-bold text-[#F79F15]"
                            : "top-5 text-sm text-[#9F9B90]"
                        }`}
                      >
                        Your Name *
                      </label>
                      {/* Orange underline expand on focus */}
                      <span
                        className={`absolute bottom-0 left-0 h-[2px] bg-[#F79F15] transition-all duration-300 pointer-events-none ${
                          focusedField === "name" ? "w-full" : "w-0"
                        }`}
                      />
                    </div>

                    {/* Email Field (Floating label over underline) */}
                    <div className="relative pt-4">
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full bg-transparent border-0 border-b border-[#9F9B90]/40 py-2 text-sm text-[#1A110A] rounded-none focus:outline-none transition-colors"
                        aria-describedby={status?.type === "error" ? "contact-form-status" : undefined}
                      />
                      <label
                        htmlFor="contact-email"
                        className={`absolute left-0 pointer-events-none transition-all duration-200 font-mono ${
                          focusedField === "email" || formData.email
                            ? "-top-1 text-[11px] font-bold text-[#F79F15]"
                            : "top-5 text-sm text-[#9F9B90]"
                        }`}
                      >
                        Your Email *
                      </label>
                      <span
                        className={`absolute bottom-0 left-0 h-[2px] bg-[#F79F15] transition-all duration-300 pointer-events-none ${
                          focusedField === "email" ? "w-full" : "w-0"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Subject Field (Floating label over underline) */}
                  <div className="relative pt-4">
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("subject")}
                      onBlur={() => setFocusedField(null)}
                      maxLength={200}
                      className="w-full bg-transparent border-0 border-b border-[#9F9B90]/40 py-2 text-sm text-[#1A110A] rounded-none focus:outline-none transition-colors"
                    />
                    <label
                      htmlFor="contact-subject"
                      className={`absolute left-0 pointer-events-none transition-all duration-200 font-mono ${
                        focusedField === "subject" || formData.subject
                          ? "-top-1 text-[11px] font-bold text-[#F79F15]"
                          : "top-5 text-sm text-[#9F9B90]"
                      }`}
                    >
                      Subject (Optional)
                    </label>
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-[#F79F15] transition-all duration-300 pointer-events-none ${
                        focusedField === "subject" ? "w-full" : "w-0"
                      }`}
                    />
                  </div>

                  {/* Message Field with Ruled Lines Background */}
                  <div className="relative pt-5">
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="contact-message"
                        className={`font-mono transition-colors ${
                          focusedField === "message"
                            ? "text-[11px] font-bold text-[#F79F15]"
                            : "text-[11px] font-medium text-[#6F6B60]"
                        }`}
                      >
                        Your Message *
                      </label>
                      <span
                        className={`text-[10px] font-mono ${
                          formData.message.length >= 4500
                            ? "text-[#F79F15] font-bold"
                            : "text-[#9F9B90]"
                        }`}
                      >
                        {formData.message.length}/5000
                      </span>
                    </div>

                    <textarea
                      id="contact-message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      rows={5}
                      maxLength={5000}
                      required
                      placeholder="Write your note here..."
                      style={{
                        lineHeight: "28px",
                        backgroundImage:
                          "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(159, 155, 144, 0.25) 27px, rgba(159, 155, 144, 0.25) 28px)",
                        backgroundAttachment: "local",
                      }}
                      className="w-full bg-transparent border-0 border-b border-[#9F9B90]/40 py-1 text-sm text-[#1A110A] placeholder:text-[#9F9B90]/60 rounded-none resize-none focus:outline-none transition-colors"
                      aria-describedby={status?.type === "error" ? "contact-form-status" : undefined}
                    />
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-[#F79F15] transition-all duration-300 pointer-events-none ${
                        focusedField === "message" ? "w-full" : "w-0"
                      }`}
                    />
                  </div>

                  {/* Status alert box (No red/green; uses site palette only) */}
                  <AnimatePresence>
                    {status && status.type === "error" && (
                      <motion.div
                        id="contact-form-status"
                        role="status"
                        aria-live="polite"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F8F5EE] border border-[#1A110A]/15 text-xs text-[#1A110A]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15] mt-1.5 shrink-0" />
                        <span>{status.message}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button "Send message" */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-3.5 min-h-[44px] rounded-full font-mono text-xs font-bold uppercase tracking-wider text-[#F5F3E7] bg-[#1A110A] hover:bg-[#F79F15] hover:text-[#1A110A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-[#1A110A] focus-visible:outline-offset-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative w-5 h-5 rounded-full bg-[#F79F15] group-hover:bg-[#1A110A] text-[#1A110A] group-hover:text-[#F5F3E7] flex items-center justify-center transition-colors">
                          <FiSend className="text-xs -translate-x-[0.5px] translate-y-[0.5px]" />
                          {/* Paper plane animated takeoff on submit */}
                          {isPlaneFlying && (
                            <motion.span
                              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                              animate={{ x: 140, y: -70, opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                              <FiSend className="text-xs text-[#F79F15]" />
                            </motion.span>
                          )}
                        </span>
                        <span>Send message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Guestbook Sub-section (Preserved exactly as it is)       */}
      {/* ======================================================== */}
      <Suspense
        fallback={
          <div className="w-full mt-24 pt-16 border-t border-[#9F9B90]/30 flex flex-col items-center justify-center min-h-[250px] gap-3">
            <div className="w-6 h-6 border-2 border-[#9F9B90]/30 border-t-[#F79F15] rounded-full animate-spin" />
            <span className="text-xs font-mono text-[#6F6B60]">Loading guestbook...</span>
          </div>
        }
      >
        <Guestbook />
      </Suspense>
    </section>
  );
}
