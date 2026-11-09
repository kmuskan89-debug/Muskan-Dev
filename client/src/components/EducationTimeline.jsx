import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { education } from "../data/content";
import { FiAward, FiBookOpen, FiCalendar, FiMapPin } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

export default function EducationTimeline() {
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const ctx = gsap.context(() => {
      // Draw timeline vertical line on scroll with GSAP ScrollTrigger
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            end: "bottom 80%",
            scrub: 0.8,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-8 relative mt-12">
      <div className="flex flex-col gap-2">
        <span className="section-label text-xs tracking-[0.2em]">
          // ACADEMIC JOURNEY
        </span>
        <h3 className="text-2xl md:text-3xl font-bold font-heading text-[#1A110A]">
          Education & Milestones
        </h3>
      </div>

      <div className="relative pl-6 sm:pl-8 flex flex-col gap-10">
        {/* Background track line */}
        <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-[2px] bg-[#9F9B90]/30" />

        {/* Dynamic GSAP Animated Vertical Progress Line */}
        <div
          ref={lineRef}
          className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-[2px] bg-[#F79F15] origin-top"
          style={shouldReduceMotion ? { transform: "scaleY(1)" } : {}}
        />

        {education.map((item, idx) => {
          const isBTech = item.degree.includes("BTech");

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: idx * 0.15 }}
              className="relative flex items-start gap-4"
            >
              {/* Timeline Node Dot */}
              <div className="absolute -left-[27px] sm:-left-[35px] top-1.5 flex items-center justify-center">
                <div
                  className="w-4 h-4 rounded-full border-2 border-[#1A110A] bg-[#FFFFFF] shadow-sm flex items-center justify-center"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-[#F79F15]"
                  />
                </div>
              </div>

              {/* Timeline Card */}
              <div
                className={`w-full rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:border-[#F79F15] border border-[#9F9B90]/30 shadow-sm ${
                  isBTech ? "bg-[#FFFFFF] border-[#F79F15]/40" : "bg-[#FFFFFF]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg md:text-xl font-bold font-heading text-[#1A110A]">
                      {item.degree}
                    </h4>
                    {isBTech && (
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#F8F5EE] border border-[#F79F15]/40 text-[#1A110A]">
                        Current
                      </span>
                    )}
                  </div>

                  {item.duration && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6F6B60] bg-[#F8F5EE] px-3 py-1 rounded-full border border-[#9F9B90]/30">
                      <FiCalendar className="text-[#F79F15]" />
                      <span>{item.duration}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6F6B60]">
                  <FiBookOpen className="text-[#F79F15] shrink-0" />
                  <span>{item.institution}</span>
                </div>

                {/* Score / CGPA Highlight for BTech */}
                {item.score && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1 rounded-lg bg-[#F8F5EE] border border-[#F79F15]/40 text-[#1A110A]">
                      <FiAward className="text-sm text-[#F79F15]" />
                      <span>{item.score}</span>
                    </span>
                    <span className="text-xs text-[#6F6B60]">
                      Strong foundational academics & coursework
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

