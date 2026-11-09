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
        // Desktop sticky stacking offset capped at 4 cards (max 64px offset) clearing the top progress bar and navbar
        top: isMobile ? "auto" : `calc(7.5rem + ${Math.min(index, 4) * 16}px)`,
      }}
      className={`w-full ${
        isMobile ? "relative mb-8" : "sticky mb-16"
      } bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 md:p-10 border border-[#9F9B90]/30 shadow-md transition-all duration-300`}
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
          className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-[#F8F5EE] border border-[#9F9B90]/30 group cursor-pointer aspect-video select-none shadow-sm"
        >
          {/* Spotlight Glow following cursor */}
          {!isMobile && (
            <motion.div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
              style={{
                background: `radial-gradient(280px circle at ${spotlightX.get()}px ${spotlightY.get()}px, rgba(247, 159, 21, 0.15), transparent 70%)`,
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
            // Generated Visual Fallback with Initials
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8F5EE] relative p-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#FFFFFF] border border-[#9F9B90]/30 flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform duration-500">
                <span className="text-3xl font-bold font-mono text-[#1A110A]">
                  {initials}
                </span>
              </div>
              <span className="text-xs font-mono text-[#6F6B60]">
                // Screenshot: client/public/projects/
              </span>
            </div>
          )}

          {/* Subtle gradient overlay for typography readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A110A]/50 via-transparent to-transparent opacity-30 pointer-events-none" />

          {/* Corner Project Index Tag */}
          <div className="absolute top-3 left-3 z-10">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#FFFFFF]/90 backdrop-blur-md border border-[#9F9B90]/30 text-[#1A110A]">
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
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-3 py-0.5 rounded-full bg-[#F8F5EE] border border-[#F79F15]/40 text-[#1A110A] shadow-sm">
                  <FiStar className="text-xs text-[#F79F15]" />
                  <span>Featured Project</span>
                </span>
              )}
            </div>

            {/* Split Title */}
            <div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#1A110A] tracking-tight">
                {mainTitle}
              </h3>
              {subTitle && (
                <p className="text-sm sm:text-base font-semibold text-[#F79F15] mt-1 font-sans">
                  {subTitle}
                </p>
              )}
            </div>

            {/* Project Description */}
            <p className="text-sm md:text-base text-[#6F6B60] leading-relaxed mt-1">
              {project.description}
            </p>

            {/* Tech Stack Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {(project.techStack || []).map((tech, i) => (
                <span
                  key={i}
                  className="text-xs font-mono px-3 py-1 rounded-lg bg-[#F8F5EE] border border-[#9F9B90]/30 text-[#1A110A] transition-colors hover:border-[#F79F15]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons: Live Demo & GitHub */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#9F9B90]/20">
            {hasLiveUrl ? (
              <Magnetic strength={0.25}>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View live demo of ${mainTitle}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-mono font-semibold bg-[#F79F15] text-[#1A110A] hover:bg-[#1A110A] hover:text-[#FFFFFF] transition-all transform hover:-translate-y-0.5 shadow-sm"
                >
                  <span>Live Demo</span>
                  <FiExternalLink className="text-sm" />
                </a>
              </Magnetic>
            ) : (
              <button
                disabled
                aria-label={`Live demo for ${mainTitle} coming soon`}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-mono font-medium bg-[#F8F5EE] border border-[#9F9B90]/30 text-[#6F6B60] opacity-70 cursor-not-allowed"
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-mono font-semibold bg-[#1A110A] border border-[#1A110A] hover:bg-[#F79F15] hover:text-[#1A110A] text-[#F5F3E7] transition-all transform hover:-translate-y-0.5 shadow-sm"
                >
                  <FiGithub className="text-sm text-[#F79F15]" />
                  <span>GitHub</span>
                </a>
              </Magnetic>
            ) : (
              <button
                disabled
                aria-label={`GitHub repository for ${mainTitle} coming soon`}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-mono font-medium bg-[#F8F5EE] border border-[#9F9B90]/30 text-[#6F6B60] opacity-70 cursor-not-allowed"
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

