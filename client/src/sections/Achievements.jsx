import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import AchievementCard from "../components/AchievementCard";
import { interpersonal, personalInfo } from "../data/content";

// Icons
import { SiLeetcode } from "react-icons/si";
import { FaTrophy } from "react-icons/fa";
import { FiZap, FiAward, FiMic, FiShield, FiUsers, FiMusic, FiCheck } from "react-icons/fi";

// Co-curricular items strictly from client/src/data/content.js
const CO_CURRICULAR_ITEMS = [
  {
    title: "National-Level Hackathons & Ideations",
    description: "Multiple national-level hackathons and ideations",
    icon: FiAward,
    accent: "#4DA3FF",
  },
  {
    title: "Public Speaking",
    description: "Debates, speeches, GD, anchoring",
    icon: FiMic,
    accent: "#5EEAD4",
  },
  {
    title: "Technical Events",
    description: "Cybersecurity, Blockchain, Extended Reality, AI",
    icon: FiShield,
    accent: "#818CF8",
  },
  {
    title: "College Technical Team",
    description: "Part of the college technical team",
    icon: FiUsers,
    accent: "#38BDF8",
  },
  {
    title: "Dance Club",
    description: "Part of the dance club",
    icon: FiMusic,
    accent: "#F472B6",
  },
];

export default function Achievements() {
  const shouldReduceMotion = useReducedMotion();

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const pillVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <section
      id="achievements"
      className="relative min-h-screen w-full flex flex-col justify-center px-6 py-28 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Background Ambient Lighting */}
      <div className="absolute top-1/4 -left-36 w-96 h-96 bg-[#4DA3FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-36 w-96 h-96 bg-[#5EEAD4]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col gap-3 mb-14">
        <div className="section-label">// 04. ACHIEVEMENTS</div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight gradient-text">
          Proof of the work.
        </h2>
      </div>

      {/* 1. Three Large Glass Highlight Cards in a Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        {/* Card 1: 100+ LeetCode with animated count-up */}
        <AchievementCard
          type="count"
          targetCount={100}
          suffix="+"
          label="DSA problems solved on LeetCode"
          icon={SiLeetcode}
          accentColor="#FFA116"
          link={personalInfo.leetcode}
          linkText="View profile"
        />

        {/* Card 2: 1st Runner Up (says only "1st Runner Up" and "Google Ideate college ideathon") */}
        <AchievementCard
          type="trophy"
          label="Google Ideate college ideathon"
          icon={FaTrophy}
          accentColor="#4DA3FF"
        />

        {/* Card 3: Hackathons (No made-up number) */}
        <AchievementCard
          type="badge"
          label="Participated in various technical hackathons"
          icon={FiZap}
          accentColor="#5EEAD4"
        />
      </div>

      {/* 2. Beyond Code: Co-Curricular Cards Grid */}
      <div className="flex flex-col gap-8 mb-20">
        <div className="flex flex-col gap-2">
          <span className="section-label text-xs tracking-[0.2em]">
            // CO-CURRICULAR
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#E8EDF3]">
            Beyond Code
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CO_CURRICULAR_ITEMS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : idx * 0.08 }}
                whileHover={{ y: -6 }}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between gap-4 border border-white/5 hover:border-[#4DA3FF]/30 transition-all duration-300 shadow-lg group select-none"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#060B16]/80 border border-white/10 group-hover:border-[#4DA3FF]/40 transition-colors"
                  style={{ color: card.accent }}
                >
                  <Icon className="text-xl transition-transform duration-300 group-hover:scale-110" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <h4 className="text-base sm:text-lg font-bold text-[#E8EDF3] group-hover:text-white transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#8A97AB] leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Interpersonal Skills Animated Pills */}
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 bg-[#0E1626]/80 backdrop-blur-xl flex flex-col gap-6 items-center text-center">
        <div className="flex flex-col gap-1 items-center">
          <span className="section-label text-xs tracking-[0.2em]">
            // INTERPERSONAL SKILLS
          </span>
          <h4 className="text-xl sm:text-2xl font-bold font-heading text-[#E8EDF3]">
            Interpersonal Strengths
          </h4>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-2xl"
        >
          {interpersonal.map((skill, index) => (
            <motion.div
              key={index}
              variants={pillVariants}
              whileHover={{ y: -4, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card border border-white/10 hover:border-[#5EEAD4]/50 bg-[#060B16]/80 text-sm font-mono font-medium text-[#E8EDF3] hover:text-[#5EEAD4] shadow-sm transition-colors cursor-default"
            >
              <FiCheck className="text-xs text-[#4DA3FF]" />
              <span>{skill}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
