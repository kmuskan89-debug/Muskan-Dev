import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import Magnetic from "./Magnetic";
import { FiExternalLink, FiGithub, FiStar, FiClock } from "react-icons/fi";

export default function ProjectCard({ project, index, total }) {
  const imageRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const imageUrl = project.imageUrl || project.image;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  // Mouse tilt on image
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || shouldReduceMotion || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);

    spotlightX.set(e.clientX - rect.left);
    spotlightY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Split title at " - "
  const rawTitle = project.title || "";
  const titleParts = rawTitle.split(" - ");
  const mainTitle = titleParts[0]?.trim() || rawTitle;
  const subTitle = titleParts.slice(1).join(" - ")?.trim();

  // Project initials for gradient fallback
  const initials = mainTitle
    .split(" ")
    .map((w) => w[0])
    .slice(0, 3)
    .join("");

  // Determine if URLs are real or empty/placeholder
  const hasLiveUrl =
    Boolean(project.liveUrl) &&
    project.liveUrl.trim() !== "" &&
    !project.liveUrl.includes("example.com");

  const hasGithubUrl =
    Boolean(project.githubUrl) &&
    project.githubUrl.trim() !== "" &&
    !project.githubUrl.includes("example.com");

  const isFeatured = Boolean(
    project.featured || mainTitle.toLowerCase().includes("devspace")
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : index * 0.1 }}
      style={{
        // Desktop sticky stacking offset capped at 4 cards (max 64px offset) so 1-12 projects don't overlap awkwardly
        top: isMobile ? "auto" : `calc(5rem + ${Math.min(index, 4) * 16}px)`,
      }}
      className={`w-full ${
        isMobile ? "relative mb-8" : "sticky mb-16"
      } glass-card rounded-3xl p-6 sm:p-8 md:p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-[#0E1626]/95 backdrop-blur-xl transition-all duration-300`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* Left Column (Desktop 7 cols): Interactive 3D Image Area */}
        <div
          ref={imageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          data-cursor="view"
          style={
            isMobile || shouldReduceMotion
              ? {}
              : {
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }
          }
          className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-[#060B16] border border-white/10 group cursor-pointer aspect-video select-none shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
          {/* Spotlight Glow following cursor */}
          {!isMobile && (
            <motion.div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
              style={{
                background: `radial-gradient(280px circle at ${spotlightX.get()}px ${spotlightY.get()}px, rgba(77, 163, 255, 0.22), transparent 70%)`,
              }}
            />
          )}

          {/* Developer Note: Real screenshots location */}
          {/* Real project screenshots can be placed in client/public/projects/ and referenced in content.js */}
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={`${mainTitle} interface screenshot`}
              onError={() => setImageError(true)}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            // Generated Visual Gradient Fallback with Initials
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0E1626] via-[#060B16] to-[#0E1626] relative p-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#4DA3FF]/20 to-[#5EEAD4]/20 border border-[#5EEAD4]/30 flex items-center justify-center shadow-[0_0_25px_rgba(77,163,255,0.2)] mb-3 group-hover:scale-110 transition-transform duration-500">
                <span className="text-3xl font-bold font-mono gradient-text">
                  {initials}
                </span>
              </div>
              <span className="text-xs font-mono text-[#8A97AB]">
                // Screenshot: client/public/projects/
              </span>
            </div>
          )}

          {/* Dark gradient overlay for typography readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060B16]/80 via-transparent to-transparent opacity-40 pointer-events-none" />

          {/* Corner Project Index Tag */}
          <div className="absolute top-3 left-3 z-10">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#060B16]/85 backdrop-blur-md border border-white/10 text-[#5EEAD4]">
              0{index + 1}
            </span>
          </div>
        </div>

        {/* Right Column (Desktop 5 cols): Content & Actions */}
        <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-3">
            
            {/* Header: Featured Badge & Subtitle */}
            <div className="flex flex-wrap items-center gap-2.5">
              {isFeatured && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-3 py-0.5 rounded-full bg-gradient-to-r from-[#4DA3FF]/20 to-[#5EEAD4]/20 border border-[#5EEAD4]/40 text-[#5EEAD4] shadow-[0_0_12px_rgba(94,234,212,0.2)]">
                  <FiStar className="text-xs" />
                  <span>Featured Project</span>
                </span>
              )}
            </div>

            {/* Split Title */}
            <div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#E8EDF3] tracking-tight">
                {mainTitle}
              </h3>
              {subTitle && (
                <p className="text-sm sm:text-base font-medium text-[#4DA3FF] mt-1 font-sans">
                  {subTitle}
                </p>
              )}
            </div>

            {/* Project Description */}
            <p className="text-sm md:text-base text-[#8A97AB] leading-relaxed mt-1">
              {project.description}
            </p>

            {/* Tech Stack Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {(project.techStack || []).map((tech, i) => (
                <span
                  key={i}
                  className="text-xs font-mono px-3 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-[#E8EDF3] transition-colors hover:border-[#4DA3FF]/40"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons: Live Demo & GitHub */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5">
            {hasLiveUrl ? (
              <Magnetic strength={0.25}>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View live demo of ${mainTitle}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-mono font-semibold bg-gradient-to-r from-[#4DA3FF] to-[#5EEAD4] text-[#060B16] shadow-[0_0_18px_rgba(77,163,255,0.3)] hover:shadow-[0_0_25px_rgba(94,234,212,0.5)] transition-all transform hover:-translate-y-0.5"
                >
                  <span>Live Demo</span>
                  <FiExternalLink className="text-sm" />
                </a>
              </Magnetic>
            ) : (
              <button
                disabled
                aria-label={`Live demo for ${mainTitle} coming soon`}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-mono font-medium bg-white/5 border border-white/10 text-[#8A97AB] opacity-60 cursor-not-allowed"
              >
                <FiClock className="text-xs" />
                <span>Live Demo (Coming soon)</span>
              </button>
            )}

            {hasGithubUrl ? (
              <Magnetic strength={0.25}>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View GitHub repository for ${mainTitle}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-mono font-semibold bg-[#060B16] border border-white/15 hover:border-[#4DA3FF]/50 text-[#E8EDF3] transition-all transform hover:-translate-y-0.5 shadow-sm"
                >
                  <FiGithub className="text-sm text-[#5EEAD4]" />
                  <span>GitHub</span>
                </a>
              </Magnetic>
            ) : (
              <button
                disabled
                aria-label={`GitHub repository for ${mainTitle} coming soon`}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-mono font-medium bg-white/5 border border-white/10 text-[#8A97AB] opacity-60 cursor-not-allowed"
              >
                <FiGithub className="text-xs" />
                <span>GitHub (Coming soon)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

