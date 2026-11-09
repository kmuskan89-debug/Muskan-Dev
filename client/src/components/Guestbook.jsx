import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import api from "../lib/api";
import { FiSend, FiMessageSquare, FiUser, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

export default function Guestbook() {
  const shouldReduceMotion = useReducedMotion();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", note: "", hp: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message: "" }

  // Fetch approved guestbook entries
  const fetchEntries = async () => {
    try {
      const res = await api.get("/guestbook");
      if (res.data && Array.isArray(res.data.data)) {
        setEntries(res.data.data);
      } else {
        setEntries([]);
      }
    } catch {
      // Graceful fallback to empty state if API is offline or down
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status) setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot check for bots
    if (formData.hp) {
      setStatus({
        type: "success",
        message: "Thanks! Your note will appear after approval.",
      });
      setFormData({ name: "", note: "", hp: "" });
      return;
    }

    if (!formData.name.trim() || !formData.note.trim()) {
      setStatus({
        type: "error",
        message: "Please enter your name and a short note.",
      });
      return;
    }

    if (formData.note.trim().length < 3) {
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
        name: formData.name.trim(),
        note: formData.note.trim(),
      });

      setStatus({
        type: "success",
        message: res.data?.message || "Thanks! Your note will appear after approval.",
      });
      setFormData({ name: "", note: "", hp: "" });
    } catch (err) {
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
          Drop a friendly note, feedback, or quick greeting. Submissions appear here once approved.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Top: Guestbook Note Form */}
        <div className="lg:col-span-5 bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#9F9B90]/30 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Honeypot field for bot protection */}
            <input
              type="text"
              name="hp"
              value={formData.hp}
              onChange={handleChange}
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="gb-name" className="text-xs font-mono text-[#6F6B60]">
                Your Name *
              </label>
              <div className="relative">
                <input
                  id="gb-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={80}
                  required
                  placeholder="e.g. Alex"
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 text-sm text-[#1A110A] placeholder:text-[#9F9B90] focus:outline-none focus:border-[#F79F15] focus:ring-1 focus:ring-[#F79F15]/50 transition-all"
                />
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#6F6B60]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="gb-note" className="text-xs font-mono text-[#6F6B60]">
                Your Note *
              </label>
              <div className="relative">
                <textarea
                  id="gb-note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={3}
                  maxLength={1000}
                  required
                  placeholder="Write a message, encouragement, or question..."
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 text-sm text-[#1A110A] placeholder:text-[#9F9B90] focus:outline-none focus:border-[#F79F15] focus:ring-1 focus:ring-[#F79F15]/50 transition-all resize-none"
                />
                <FiMessageSquare className="absolute left-3.5 top-4 text-sm text-[#6F6B60]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl font-mono text-xs font-semibold uppercase tracking-wider text-[#F5F3E7] bg-[#1A110A] hover:bg-[#F79F15] hover:text-[#1A110A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer shadow-sm"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#F5F3E7] border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FiSend className="text-sm" />
                  <span>Sign Guestbook</span>
                </>
              )}
            </button>

            {/* Status alerts */}
            <AnimatePresence>
              {status && (
                <motion.div
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`flex items-start gap-2.5 p-3.5 rounded-xl text-xs ${
                    status.type === "success"
                      ? "bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/30"
                      : "bg-[#C62828]/10 text-[#C62828] border border-[#C62828]/30"
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

        {/* Right: Approved Notes Feed */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-[#6F6B60] tracking-wider">
              Approved Notes ({entries.length})
            </span>
            <span className="text-[11px] font-mono text-[#F79F15] flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15] animate-pulse" />
              Live Feed
            </span>
          </div>

          {loading ? (
            // Skeleton loaders
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#9F9B90]/20 animate-pulse flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-4 bg-[#F8F5EE] rounded-md" />
                    <div className="w-16 h-3 bg-[#F8F5EE] rounded-md" />
                  </div>
                  <div className="w-full h-10 bg-[#F8F5EE] rounded-md" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            // Empty state fallback
            <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#9F9B90]/30 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F8F5EE] flex items-center justify-center text-[#6F6B60]">
                <FiMessageSquare className="text-2xl" />
              </div>
              <p className="text-sm font-semibold text-[#1A110A]">
                No public notes yet.
              </p>
              <p className="text-xs text-[#6F6B60] max-w-sm">
                Be the first to sign the guestbook! Use the form to write a note.
              </p>
            </div>
          ) : (
            // Approved notes list
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: shouldReduceMotion ? 0 : 0.08,
                  },
                },
              }}
              className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar"
            >
              {entries.map((entry) => (
                <motion.div
                  key={entry._id || entry.id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#9F9B90]/30 hover:border-[#F79F15] transition-all duration-300 flex flex-col gap-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#F8F5EE] border border-[#9F9B90]/30 flex items-center justify-center text-xs font-mono font-bold text-[#1A110A]">
                        {entry.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                      <span className="text-sm font-bold text-[#1A110A]">
                        {entry.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#6F6B60]">
                      <FiClock className="text-xs" />
                      <span>
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          : "Recently"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#6F6B60] leading-relaxed break-words pl-9">
                    {entry.note}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

