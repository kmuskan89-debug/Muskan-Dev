import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Preloader from "./components/Preloader";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import Navbar from "./components/Navbar";
import Magnetic from "./components/Magnetic";
import Hero from "./sections/Hero";
import About from "./sections/About";
import { personalInfo } from "./data/content";

const REMAINING_SECTIONS = [
  { id: "skills", label: "// 02. TECHNICAL ARSENAL", title: "Skills & Technologies", subtitle: "Languages, Frameworks, Databases & Tools" },
  { id: "projects", label: "// 03. FEATURED WORK", title: "Projects", subtitle: "Production-ready Full-Stack Applications" },
  { id: "achievements", label: "// 04. HONORS & MILESTONES", title: "Achievements", subtitle: "Competitions, Ideathons & DSA Milestones" },
  { id: "contact", label: "// 05. GET IN TOUCH", title: "Contact", subtitle: "Let's connect and build something impactful" },
];

export default function App() {
  const [preloaderComplete, setPreloaderComplete] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#060B16] text-[#E8EDF3] selection:bg-[#4DA3FF]/30 selection:text-[#5EEAD4]">
      <Helmet>
        <title>{personalInfo.name} | MERN Stack Developer</title>
        <meta name="description" content={personalInfo.objective} />
      </Helmet>

      {/* 1.2s Preloader with MK Monogram Drawing */}
      <Preloader onComplete={() => setPreloaderComplete(true)} />

      {/* Thin Scroll Progress Bar */}
      <ScrollProgress />

      {/* Desktop Custom Cursor with Trailing Ring */}
      <CustomCursor />

      {/* Floating Glass Navbar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="relative z-10 flex flex-col">
        {/* Hero Section */}
        <Hero preloaderComplete={preloaderComplete} />

        {/* About Section & Full-Width Marquee Strip */}
        <About />

        {/* Remaining Sections Placeholders */}
        {REMAINING_SECTIONS.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-24 border-b border-white/[0.04] relative overflow-hidden"
          >
            {/* Subtle Ambient Section Glow */}
            <div
              className={`absolute w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-15 ${
                idx % 2 === 0 ? "bg-[#4DA3FF] -top-20 -left-20" : "bg-[#5EEAD4] -bottom-20 -right-20"
              }`}
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-4xl w-full flex flex-col items-center text-center gap-6 glass-card rounded-3xl p-12 md:p-16 relative"
            >
              <div className="section-label">{section.label}</div>

              <h2 className="text-4xl md:text-6xl font-bold tracking-tight gradient-text">
                {section.title}
              </h2>

              <p className="text-base md:text-xl text-[#8A97AB] max-w-xl font-normal leading-relaxed">
                {section.subtitle}
              </p>

              {/* Navigation link to next section */}
              <div className="mt-4 flex items-center gap-4">
                <Magnetic strength={0.3}>
                  <a
                    href={idx === REMAINING_SECTIONS.length - 1 ? "#home" : `#${REMAINING_SECTIONS[idx + 1].id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-mono font-medium border border-white/10 hover:border-[#4DA3FF]/50 hover:bg-[#4DA3FF]/10 text-[#E8EDF3] transition-all"
                  >
                    <span>
                      {idx === REMAINING_SECTIONS.length - 1 ? "Scroll to Top ↑" : `Next: ${REMAINING_SECTIONS[idx + 1].title} ↓`}
                    </span>
                  </a>
                </Magnetic>
              </div>
            </motion.div>
          </section>
        ))}
      </main>
    </div>
  );
}
