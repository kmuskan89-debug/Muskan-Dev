import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function PullQuote() {
  const shouldReduceMotion = useReducedMotion();
  const quoteText = "Tools are important, but curiosity builds better developers.";
  const words = quoteText.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
        delayChildren: 0.15,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="w-full py-20 px-6 flex justify-center relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute w-80 h-32 bg-[#4DA3FF]/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
        <span className="text-4xl sm:text-5xl font-mono text-[#5EEAD4]/30 leading-none mb-3">
          “
        </span>

        <motion.p
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#E8EDF3] leading-snug tracking-tight max-w-3xl"
        >
          {words.map((word, index) => {
            const isHighlight =
              word.toLowerCase().includes("curiosity") ||
              word.toLowerCase().includes("better") ||
              word.toLowerCase().includes("developers");

            return (
              <motion.span
                key={index}
                variants={wordVariants}
                className={`inline-block mr-2 sm:mr-3 ${
                  isHighlight ? "gradient-text" : "text-[#E8EDF3]/90"
                }`}
              >
                {word}
              </motion.span>
            );
          })}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-6 flex items-center gap-3"
        >
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#4DA3FF]" />
          <span className="text-xs font-mono tracking-widest uppercase text-[#8A97AB]">
            Core Philosophy
          </span>
          <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#5EEAD4]" />
        </motion.div>
      </div>
    </div>
  );
}

