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

// Map skill items from content.js with their icons and accent colors
const SKILL_ITEMS = [
  // Languages
  { name: "JavaScript (ES6+)", category: "Languages", icon: SiJavascript, color: "#F7DF1E" },
  { name: "Java", category: "Languages", icon: FaJava, color: "#E76F00" },
  { name: "Python", category: "Languages", icon: SiPython, color: "#3776AB" },
  { name: "C", category: "Languages", icon: SiC, color: "#659AD2" },

  // Frontend
  { name: "React.js", category: "Frontend", icon: SiReact, color: "#61DAFB" },
  { name: "HTML5", category: "Frontend", icon: SiHtml5, color: "#E34F26" },
  { name: "CSS3", category: "Frontend", icon: FaCss3Alt, color: "#1572B6" },
  { name: "Tailwind CSS", category: "Frontend", icon: SiTailwindcss, color: "#06B6D4" },

  // Backend
  { name: "Node.js", category: "Backend", icon: SiNodedotjs, color: "#5FA04E" },
  { name: "Express.js", category: "Backend", icon: SiExpress, color: "#E8EDF3" },
  { name: "REST APIs", category: "Backend", icon: FiServer, color: "#4DA3FF" },
  { name: "JWT Authentication", category: "Backend", icon: SiJsonwebtokens, color: "#D63AFF" },

  // Database
  { name: "MongoDB", category: "Database", icon: SiMongodb, color: "#47A248" },
  { name: "Mongoose", category: "Database", icon: FiDatabase, color: "#880000" },
  { name: "MySQL", category: "Database", icon: SiMysql, color: "#4479A1" },

  // Tools
  { name: "Git", category: "Tools", icon: SiGit, color: "#F05032" },
  { name: "GitHub", category: "Tools", icon: SiGithub, color: "#E8EDF3" },
  { name: "Postman", category: "Tools", icon: SiPostman, color: "#FF6C37" },
  { name: "VS Code", category: "Tools", icon: VscVscode, color: "#007ACC" },
  { name: "Vercel", category: "Tools", icon: SiVercel, color: "#E8EDF3" },
  { name: "MongoDB Atlas", category: "Tools", icon: SiMongodb, color: "#47A248" },

  // Core CS
  { name: "Data Structures & Algorithms", category: "Core CS", icon: FiCpu, color: "#5EEAD4" },
  { name: "OOPs", category: "Core CS", icon: FiBox, color: "#4DA3FF" },
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
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-1/3 -right-36 w-96 h-96 bg-[#4DA3FF]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 -left-36 w-96 h-96 bg-[#5EEAD4]/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col gap-3 mb-10">
          <div className="section-label">// 02. SKILLS</div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight gradient-text">
            Skills that build possibilities.
          </h2>
          <p className="text-sm md:text-base text-[#8A97AB] max-w-xl">
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
          {/* Animated Gradient Outer Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4DA3FF] via-[#5EEAD4] to-[#4DA3FF] opacity-75 animate-pulse [animation-duration:4s]" />

          <div className="relative glass-card rounded-[22px] p-6 sm:p-8 bg-[#0E1626]/95 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex flex-col gap-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5EEAD4] shadow-[0_0_8px_#5EEAD4] animate-ping" />
                <span className="text-xs font-mono font-semibold tracking-widest text-[#5EEAD4] uppercase">
                  Currently Exploring
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-[#E8EDF3]">
                AI / Machine Learning
              </h3>

              <p className="text-sm sm:text-base text-[#8A97AB] max-w-xl leading-relaxed">
                Currently exploring AI and Machine Learning concepts alongside core full-stack web development.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#E8EDF3] bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <FiCheckCircle className="text-[#5EEAD4]" />
                  <span>Mathematics & Model Basics</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#E8EDF3] bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <FiCheckCircle className="text-[#4DA3FF]" />
                  <span>Python Ecosystem</span>
                </span>
              </div>
            </div>

            {/* Small Lightweight 3D Torus/Icosahedron Object (Decorative) */}
            <div aria-hidden="true" className="flex items-center justify-center">
              <Suspense
                fallback={
                  <div className="w-[180px] h-[180px] rounded-2xl bg-[#060B16]/50 animate-pulse flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#4DA3FF]/30 border-t-[#5EEAD4] rounded-full animate-spin" />
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
                  isActive ? "text-[#060B16] font-semibold" : "text-[#8A97AB] hover:text-[#E8EDF3] bg-white/[0.03] border border-white/5 hover:border-white/10"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="skills-tab-indicator"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4DA3FF] to-[#5EEAD4] -z-10 shadow-[0_0_15px_rgba(77,163,255,0.4)]"
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
                  accentColor={skill.color}
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
