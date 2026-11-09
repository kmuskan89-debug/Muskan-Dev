import React from "react";
import { motion } from "framer-motion";
import AboutPhotoCard from "../components/AboutPhotoCard";
import EducationTimeline from "../components/EducationTimeline";
import MarqueeStrip from "../components/MarqueeStrip";
import { personalInfo } from "../data/content";
import { FiMapPin, FiCpu, FiCode, FiZap } from "react-icons/fi";

export default function About() {
  const lineRevealVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: custom * 0.12,
        ease: "easeOut",
      },
    }),
  };

  return (
    <>
      <section
        id="about"
        className="relative min-h-screen w-full flex flex-col justify-center px-6 py-28 max-w-6xl mx-auto overflow-hidden"
      >
        {/* Subtle Ambient Background Light */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#F79F15]/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col gap-3 mb-14">
          <motion.div
            variants={lineRevealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="section-label"
          >
            // 01. ABOUT ME
          </motion.div>

          <motion.h2
            variants={lineRevealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight text-[#1A110A]"
          >
            More than just a developer.
          </motion.h2>
        </div>

        {/* Main Grid: Left Photo Card | Right Biography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: 3D Tilting Portrait & Drifting Glass Chips */}
          <motion.div
            variants={lineRevealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={2}
            className="lg:col-span-5 flex justify-center"
          >
            <AboutPhotoCard />
          </motion.div>

          {/* Right Column: Bio, Learning Status & Quick Highlights */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Intro Paragraph 1 */}
            <motion.p
              variants={lineRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              className="text-lg md:text-xl text-[#1A110A] leading-relaxed font-normal"
            >
              {personalInfo.objective}
            </motion.p>

            {/* Intro Paragraph 2 with Location */}
            <motion.p
              variants={lineRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={3}
              className="text-sm md:text-base text-[#6F6B60] leading-relaxed"
            >
              Based in <span className="text-[#1A110A] font-medium">{personalInfo.location}</span>, I combine disciplined problem-solving in Data Structures & Algorithms with practical full-stack engineering to architect responsive, resilient web platforms.
            </motion.p>

            {/* Highlighted Card: Currently Learning AI/ML with Animated Border */}
            <motion.div
              variants={lineRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={4}
              className="relative p-[1.5px] rounded-2xl overflow-hidden mt-2 group"
            >
              {/* Border */}
              <div className="absolute inset-0 bg-[#F79F15]/40 opacity-75" />

              <div className="relative rounded-[14px] p-5 bg-[#FFFFFF] border border-[#9F9B90]/30 shadow-sm flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#F8F5EE] border border-[#9F9B90]/30 text-[#F79F15] shrink-0">
                  <FiCpu className="text-xl" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-[#F79F15] uppercase tracking-wider">
                      Active Exploration
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F79F15] animate-ping" />
                  </div>
                  <h4 className="text-base md:text-lg font-bold text-[#1A110A]">
                    {personalInfo.currentlyLearning}
                  </h4>
                </div>
              </div>
            </motion.div>

            {/* Quick Context Chips */}
            <motion.div
              variants={lineRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={5}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2"
            >
              <div className="bg-[#FFFFFF] rounded-xl p-3 flex items-center gap-2.5 border border-[#9F9B90]/30 shadow-sm">
                <FiMapPin className="text-[#F79F15] shrink-0" />
                <span className="text-xs font-mono text-[#1A110A]">{personalInfo.location}</span>
              </div>
              <div className="bg-[#FFFFFF] rounded-xl p-3 flex items-center gap-2.5 border border-[#9F9B90]/30 shadow-sm">
                <FiCode className="text-[#1A110A] shrink-0" />
                <span className="text-xs font-mono text-[#1A110A]">100+ LeetCode DSA</span>
              </div>
              <div className="bg-[#FFFFFF] rounded-xl p-3 flex items-center gap-2.5 border border-[#9F9B90]/30 shadow-sm col-span-2 sm:col-span-1">
                <FiZap className="text-[#F79F15] shrink-0" />
                <span className="text-xs font-mono text-[#1A110A]">Ideathon Finalist</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Education Timeline Below */}
        <EducationTimeline />
      </section>

      {/* Full-width 2-row Marquee Strip */}
      <MarqueeStrip />
    </>
  );
}

