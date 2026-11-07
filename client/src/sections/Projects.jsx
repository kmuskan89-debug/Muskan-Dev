import React, { useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "../components/SmoothScroll";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "../components/ProjectCard";
import TaglineStrip from "../components/TaglineStrip";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const { projects, loading, error, source } = useProjects();
  const lenis = useLenis();

  // Recalculate ScrollTrigger markers and smooth-scroll bounds when projects load or change
  useEffect(() => {
    if (!loading && projects.length > 0) {
      const timer = setTimeout(() => {
        lenis?.resize();
        ScrollTrigger.refresh();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, projects.length, lenis]);

  return (
    <section
      id="projects"
      className="relative min-h-screen w-full flex flex-col justify-center px-6 py-28 max-w-6xl mx-auto"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -right-36 w-96 h-96 bg-[#4DA3FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-36 w-96 h-96 bg-[#5EEAD4]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col gap-3 mb-16">
        <div className="flex items-center justify-between">
          <div className="section-label">// 03. PROJECTS</div>
          
          {/* Subtle Live/Cached Source Pill (Development Only) */}
          {!loading && import.meta.env.DEV && (
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-white/5 bg-white/[0.02] text-[#8A97AB]">
              {source === "api" ? "● Live Data" : "● Local Store"}
            </span>
          )}
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading tracking-tight gradient-text">
          Projects that solve real problems.
        </h2>

        <p className="text-sm md:text-base text-[#8A97AB] max-w-xl">
          Full-stack web applications and backend systems engineered for scalability, team collaboration, and real-world utility.
        </p>
      </div>

      {/* Sticky Stacking Projects List */}
      <div className="relative flex flex-col w-full">
        {loading ? (
          // Loading Skeletons
          <div className="flex flex-col gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="glass-card rounded-3xl p-8 sm:p-10 border border-white/5 animate-pulse flex flex-col lg:flex-row gap-8"
              >
                <div className="lg:w-7/12 aspect-video bg-white/5 rounded-2xl" />
                <div className="lg:w-5/12 flex flex-col gap-4 justify-center">
                  <div className="h-4 w-24 bg-white/10 rounded" />
                  <div className="h-8 w-3/4 bg-white/10 rounded" />
                  <div className="h-4 w-full bg-white/5 rounded" />
                  <div className="h-4 w-5/6 bg-white/5 rounded" />
                  <div className="flex gap-2 pt-4">
                    <div className="h-10 w-28 bg-white/10 rounded-full" />
                    <div className="h-10 w-28 bg-white/10 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          projects.map((project, index) => (
            <ProjectCard
              key={project._id || project.slug || index}
              project={project}
              index={index}
              total={projects.length}
            />
          ))
        )}
      </div>

      {/* Post-Projects Tagline Strip */}
      <TaglineStrip />
    </section>
  );
}

