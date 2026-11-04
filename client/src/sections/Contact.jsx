import React, { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import api from "../lib/api";
import Magnetic from "../components/Magnetic";
import { personalInfo } from "../data/content";

// Lazy-load Guestbook sub-section
const Guestbook = lazy(() => import("../components/Guestbook"));

// Icons
import {
  FiMail,
  FiPhone,
  FiLinkedin,
  FiGithub,
  FiMapPin,
  FiCopy,
  FiCheck,
  FiSend,
  FiDownload,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { SiLeetcode } from "react-icons/si";

export default function Contact() {
  const shouldReduceMotion = useReducedMotion();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    hp: "", // Honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message: "" }
  const [copiedField, setCopiedField] = useState(null); // "email" | "phone" | null

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
      setStatus({
        type: "success",
        message: "Thank you for reaching out! Your message has been sent successfully.",
      });
      setFormData({ name: "", email: "", subject: "", message: "", hp: "" });
      return;
    }

    const error = validateForm();
    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await api.post("/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setStatus({
        type: "success",
        message:
          res.data?.message ||
          "Thank you for reaching out! Your message has been sent successfully.",
      });
      setFormData({ name: "", email: "", subject: "", message: "", hp: "" });
    } catch (err) {
      if (err.response?.status === 429) {
        setStatus({
          type: "error",
          message:
            "Too many requests. Please wait a moment before sending another message.",
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
    }
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen w-full flex flex-col justify-center px-6 py-28 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-36 w-96 h-96 bg-[#4DA3FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 -left-36 w-96 h-96 bg-[#5EEAD4]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col gap-3 mb-16">
        <div className="section-label">// 05. CONTACT</div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight gradient-text">
          Let's Build Something Amazing Together.
        </h2>
        <p className="text-sm md:text-base text-[#8A97AB] max-w-xl">
          Whether you have a project idea, an open engineering role, or just want to connect, feel free to reach out.
        </p>
      </div>

      {/* Main Grid: Left Contact Cards, Right Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Direct Contact Info & Links */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Email Card with Copy Toast */}
          <Magnetic strength={0.2} className="w-full">
            <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-[#4DA3FF]/40 bg-[#0E1626]/70 transition-all duration-300 flex items-center justify-between group">
              <a
                href={`mailto:${personalInfo.email}`}
                className="flex items-center gap-3.5 min-w-0"
              >
                <div className="w-11 h-11 rounded-xl bg-[#4DA3FF]/10 border border-[#4DA3FF]/20 flex items-center justify-center text-[#4DA3FF] group-hover:scale-110 transition-transform">
                  <FiMail className="text-xl" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A97AB]">
                    Email
                  </span>
                  <span className="text-sm font-semibold text-[#E8EDF3] group-hover:text-white truncate">
                    {personalInfo.email}
                  </span>
                </div>
              </a>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(personalInfo.email, "email")}
                  aria-label="Copy email address"
                  className="min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8A97AB] hover:text-[#5EEAD4] transition-all cursor-pointer"
                >
                  {copiedField === "email" ? (
                    <FiCheck className="text-sm text-[#5EEAD4]" />
                  ) : (
                    <FiCopy className="text-sm" />
                  )}
                </button>
                <AnimatePresence>
                  {copiedField === "email" && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 -top-8 px-2 py-0.5 rounded text-[10px] font-mono bg-[#5EEAD4] text-[#060B16] font-bold shadow-md"
                    >
                      Copied!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Magnetic>

          {/* Phone Card with Copy Toast */}
          <Magnetic strength={0.2} className="w-full">
            <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-[#5EEAD4]/40 bg-[#0E1626]/70 transition-all duration-300 flex items-center justify-between group">
              <a
                href={`tel:${personalInfo.phone}`}
                className="flex items-center gap-3.5 min-w-0"
              >
                <div className="w-11 h-11 rounded-xl bg-[#5EEAD4]/10 border border-[#5EEAD4]/20 flex items-center justify-center text-[#5EEAD4] group-hover:scale-110 transition-transform">
                  <FiPhone className="text-xl" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A97AB]">
                    Phone
                  </span>
                  <span className="text-sm font-semibold text-[#E8EDF3] group-hover:text-white truncate">
                    {personalInfo.phone}
                  </span>
                </div>
              </a>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(personalInfo.phone, "phone")}
                  aria-label="Copy phone number"
                  className="min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8A97AB] hover:text-[#5EEAD4] transition-all cursor-pointer"
                >
                  {copiedField === "phone" ? (
                    <FiCheck className="text-sm text-[#5EEAD4]" />
                  ) : (
                    <FiCopy className="text-sm" />
                  )}
                </button>
                <AnimatePresence>
                  {copiedField === "phone" && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 -top-8 px-2 py-0.5 rounded text-[10px] font-mono bg-[#5EEAD4] text-[#060B16] font-bold shadow-md"
                    >
                      Copied!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Magnetic>

          {/* Social Profiles Grid: LinkedIn, GitHub, LeetCode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* LinkedIn */}
            <Magnetic strength={0.25} className="w-full">
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Muskan's LinkedIn profile"
                className="glass-card rounded-2xl p-4 min-h-[44px] border border-white/10 hover:border-[#4DA3FF]/40 bg-[#0E1626]/70 flex flex-col items-center justify-center text-center gap-2 group transition-all"
              >
                <FiLinkedin className="text-2xl text-[#4DA3FF] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-medium text-[#E8EDF3]">
                  LinkedIn
                </span>
              </a>
            </Magnetic>

            {/* GitHub */}
            <Magnetic strength={0.25} className="w-full">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Muskan's GitHub profile"
                className="glass-card rounded-2xl p-4 min-h-[44px] border border-white/10 hover:border-[#5EEAD4]/40 bg-[#0E1626]/70 flex flex-col items-center justify-center text-center gap-2 group transition-all"
              >
                <FiGithub className="text-2xl text-[#5EEAD4] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-medium text-[#E8EDF3]">
                  GitHub
                </span>
              </a>
            </Magnetic>

            {/* LeetCode */}
            <Magnetic strength={0.25} className="w-full">
              <a
                href={personalInfo.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Muskan's LeetCode profile"
                className="glass-card rounded-2xl p-4 min-h-[44px] border border-white/10 hover:border-[#FFA116]/40 bg-[#0E1626]/70 flex flex-col items-center justify-center text-center gap-2 group transition-all"
              >
                <SiLeetcode className="text-2xl text-[#FFA116] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-medium text-[#E8EDF3]">
                  LeetCode
                </span>
              </a>
            </Magnetic>
          </div>

          {/* Location Card */}
          <Magnetic strength={0.15} className="w-full">
            <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0E1626]/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#5EEAD4]">
                <FiMapPin className="text-lg" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A97AB]">
                  Location
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#E8EDF3]">
                  {personalInfo.location}
                </span>
              </div>
            </div>
          </Magnetic>

          {/* Download Resume Button */}
          <div className="mt-2">
            <Magnetic strength={0.3} className="w-full">
              <a
                href={personalInfo.resume}
                download="Muskan_Kumari_Resume.pdf"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-mono text-xs font-semibold uppercase tracking-wider text-[#E8EDF3] glass-card border border-white/10 hover:border-[#4DA3FF]/50 hover:bg-[#4DA3FF]/10 transition-all duration-300 group shadow-md"
              >
                <FiDownload className="text-sm text-[#4DA3FF] group-hover:translate-y-0.5 transition-transform" />
                <span>Download Resume</span>
              </a>
            </Magnetic>
          </div>
        </div>

        {/* Right Column: Glass Contact Form */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-3xl p-7 sm:p-9 border border-white/10 bg-[#0E1626]/80 backdrop-blur-xl shadow-2xl relative">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Bot Protection Honeypot */}
              <input
                type="text"
                name="hp"
                value={formData.hp}
                onChange={handleInputChange}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-name" className="text-xs font-mono text-[#8A97AB]">
                    Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-[#060B16]/80 border border-white/10 text-sm text-[#E8EDF3] placeholder:text-white/20 focus:outline-none focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF]/50 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-email" className="text-xs font-mono text-[#8A97AB]">
                    Email *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#060B16]/80 border border-white/10 text-sm text-[#E8EDF3] placeholder:text-white/20 focus:outline-none focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF]/50 transition-all"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-subject" className="text-xs font-mono text-[#8A97AB]">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What is this regarding?"
                  className="w-full px-4 py-3 rounded-xl bg-[#060B16]/80 border border-white/10 text-sm text-[#E8EDF3] placeholder:text-white/20 focus:outline-none focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF]/50 transition-all"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-xs font-mono text-[#8A97AB]">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  required
                  placeholder="Share details about your project, idea, or questions..."
                  className="w-full px-4 py-3 rounded-xl bg-[#060B16]/80 border border-white/10 text-sm text-[#E8EDF3] placeholder:text-white/20 focus:outline-none focus:border-[#4DA3FF] focus:ring-1 focus:ring-[#4DA3FF]/50 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <Magnetic strength={0.2} className="w-full">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider text-[#060B16] bg-gradient-to-r from-[#4DA3FF] to-[#5EEAD4] hover:shadow-[0_0_30px_rgba(77,163,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#060B16] border-t-transparent rounded-full animate-spin" />
                      <span>Sending message...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="text-sm" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </Magnetic>

              {/* Status alerts */}
              <AnimatePresence>
                {status && (
                  <motion.div
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-start gap-3 p-4 rounded-xl text-xs leading-relaxed ${
                      status.type === "success"
                        ? "bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/30"
                        : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {status.type === "success" ? (
                      <FiCheckCircle className="text-base shrink-0 mt-0.5" />
                    ) : (
                      <FiAlertCircle className="text-base shrink-0 mt-0.5" />
                    )}
                    <span>{status.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>

      {/* Guestbook Sub-section (Lazy-loaded) */}
      <Suspense
        fallback={
          <div className="w-full mt-24 pt-16 border-t border-white/10 flex flex-col items-center justify-center min-h-[250px] gap-3">
            <div className="w-6 h-6 border-2 border-[#4DA3FF]/30 border-t-[#5EEAD4] rounded-full animate-spin" />
            <span className="text-xs font-mono text-[#8A97AB]">Loading guestbook...</span>
          </div>
        }
      >
        <Guestbook />
      </Suspense>
    </section>
  );
}

