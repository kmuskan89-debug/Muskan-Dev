import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import SkillCard from "../components/SkillCard";
import PullQuote from "../components/PullQuote";
import { skills, personalInfo } from "../data/content";

// Lazy-loaded lightweight 3D canvas
const AIExploringCanvas = lazy(() => import("../three/AIExploringCanvas"));

// Icons
import {
  SiJavascript,
  SiPython,
  SiC,
  SiReact,
  SiHtml5,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiJsonwebtokens,
  SiMongodb,
  SiMysql,
  SiGit,
  SiGithub,
  SiPostman,
  SiVercel,
} from "react-icons/si";
import { FaJava, FaCss3Alt } from "react-icons/fa";
import { VscVscode } from "react-icons/vsc";
import { FiServer, FiDatabase, FiCpu, FiBox, FiCheckCircle } from "react-icons/fi";

const CATEGORIES = [
  "All",
  "Languages",
  "Frontend",
  "Backend",
  "Database",
  "Tools",
  "Core CS",
];

// Map skill items from content.js with their icons and authentic brand colors
const SKILL_ITEMS = [
  // Languages
  { name: "JavaScript (ES6+)", category: "Languages", icon: SiJavascript, brandColor: "#F7DF1E" },
  { name: "Java", category: "Languages", icon: FaJava, brandColor: "#E76F00" },
  { name: "Python", category: "Languages", icon: SiPython, brandColor: "#3776AB" },
  { name: "C", category: "Languages", icon: SiC, brandColor: "#00599C" },

  // Frontend
  { name: "React.js", category: "Frontend", icon: SiReact, brandColor: "#61DAFB" },
  { name: "HTML5", category: "Frontend", icon: SiHtml5, brandColor: "#E34F26" },
  { name: "CSS3", category: "Frontend", icon: FaCss3Alt, brandColor: "#1572B6" },
  { name: "Tailwind CSS", category: "Frontend", icon: SiTailwindcss, brandColor: "#06B6D4" },

  // Backend
  { name: "Node.js", category: "Backend", icon: SiNodedotjs, brandColor: "#5FA04E" },
  { name: "Express.js", category: "Backend", icon: SiExpress, brandColor: "#000000" },
  { name: "REST APIs", category: "Backend", icon: FiServer, brandColor: "#009688" },
  { name: "JWT Authentication", category: "Backend", icon: SiJsonwebtokens, brandColor: "#D63AFF" },

  // Database
  { name: "MongoDB", category: "Database", icon: SiMongodb, brandColor: "#47A248" },
  { name: "Mongoose", category: "Database", icon: FiDatabase, brandColor: "#880000" },
  { name: "MySQL", category: "Database", icon: SiMysql, brandColor: "#4479A1" },

  // Tools
  { name: "Git", category: "Tools", icon: SiGit, brandColor: "#F05032" },
  { name: "GitHub", category: "Tools", icon: SiGithub, brandColor: "#181717" },
  { name: "Postman", category: "Tools", icon: SiPostman, brandColor: "#FF6C37" },
  { name: "VS Code", category: "Tools", icon: VscVscode, brandColor: "#007ACC" },
  { name: "Vercel", category: "Tools", icon: SiVercel, brandColor: "#000000" },
  { name: "MongoDB Atlas", category: "Tools", icon: SiMongodb, brandColor: "#47A248" },

  // Core CS
  { name: "Data Structures & Algorithms", category: "Core CS", icon: FiCpu, brandColor: "#F79F15" },
  { name: "OOPs", category: "Core CS", icon: FiBox, brandColor: "#F79F15" },
];

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Pause 3D canvas rendering when skills section is scrolled off screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const filteredSkills =
    activeCategory === "All"
      ? SKILL_ITEMS
      : SKILL_ITEMS.filter((skill) => skill.category === activeCategory);

  return (
    <>
      <section
        ref={sectionRef}
        id="skills"
        className="relative min-h-screen w-full flex flex-col justify-center px-6 py-28 max-w-6xl mx-auto overflow-hidden"
      >
        {/* Section Header */}
        <div className="flex flex-col gap-3 mb-10">
          <div className="section-label">// 02. SKILLS</div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight text-[#1A110A]">
            Skills that build possibilities.
          </h2>
          <p className="text-sm md:text-base text-[#6F6B60] max-w-xl">
            A comprehensive overview of programming languages, frontend and backend technologies, databases, and development tooling.
          </p>
        </div>

        {/* Highlight Card: Currently Exploring AI / Machine Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative p-[1.5px] rounded-3xl overflow-hidden mb-12 group"
        >
          {/* Subtle Outer Border */}
          <div className="absolute inset-0 bg-[#F79F15]/40 opacity-75 rounded-3xl" />

          <div className="relative rounded-[22px] p-6 sm:p-8 bg-[#FFFFFF] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 border border-[#9F9B90]/30 shadow-md">
            <div className="flex flex-col gap-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F79F15] shadow-[0_0_8px_#F79F15] animate-ping" />
                <span className="text-xs font-mono font-semibold tracking-widest text-[#F79F15] uppercase">
                  Currently Exploring
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-[#1A110A]">
                AI / Machine Learning
              </h3>

              <p className="text-sm sm:text-base text-[#6F6B60] max-w-xl leading-relaxed">
                Currently exploring AI and Machine Learning concepts alongside core full-stack web development.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#1A110A] bg-[#F8F5EE] px-3 py-1 rounded-full border border-[#9F9B90]/30">
                  <FiCheckCircle className="text-[#F79F15]" />
                  <span>Mathematics & Model Basics</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#1A110A] bg-[#F8F5EE] px-3 py-1 rounded-full border border-[#9F9B90]/30">
                  <FiCheckCircle className="text-[#F79F15]" />
                  <span>Python Ecosystem</span>
                </span>
              </div>
            </div>

            {/* Small Lightweight 3D Torus/Icosahedron Object (Decorative) */}
            <div aria-hidden="true" className="flex items-center justify-center">
              <Suspense
                fallback={
                  <div className="w-[180px] h-[180px] rounded-2xl bg-[#F8F5EE] animate-pulse flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#9F9B90]/30 border-t-[#F79F15] rounded-full animate-spin" />
                  </div>
                }
              >
                <AIExploringCanvas isVisible={isInView} />
              </Suspense>
            </div>
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        <div role="tablist" aria-label="Skill categories" className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none select-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2.5 min-h-[44px] rounded-full text-xs sm:text-sm font-mono font-medium transition-colors whitespace-nowrap z-10 cursor-pointer flex items-center justify-center ${
                  isActive ? "text-[#FFFFFF] font-semibold" : "text-[#6F6B60] hover:text-[#1A110A] bg-[#F8F5EE] border border-[#9F9B90]/30 hover:border-[#1A110A]/30"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="skills-tab-indicator"
                    className="absolute inset-0 rounded-full bg-[#1A110A] -z-10 shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Skills Grid: 2-column mobile, 3-column tablet, 4-column desktop */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -10 }}
                transition={{
                  duration: 0.35,
                  delay: shouldReduceMotion ? 0 : index * 0.03,
                  ease: "easeOut",
                }}
              >
                <SkillCard
                  name={skill.name}
                  category={skill.category}
                  icon={skill.icon}
                  brandColor={skill.brandColor}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Philosophy Pull-Quote Between Skills and Next Section */}
      <PullQuote />
    </>
  );
}
